#!/usr/bin/env python3
"""PMHub 站点 → Cloudflare Pages 直传部署（复刻 wrangler pages deploy 的 API 流程）。

用法（Token 从环境变量读取，绝不写入源码）：
    export CF_TOKEN="cfat_xxx"          # Cloudflare API Token（Pages:Edit 权限）
    export CF_ACCOUNT_ID="xxxxxxxx"     # Cloudflare 账户 ID
    python3 deploy.py
"""
import base64, json, mimetypes, os, sys, time
import urllib.request

try:
    import blake3
except ImportError:
    sys.exit("缺少 blake3，请先执行: pip install blake3")

API = "https://api.cloudflare.com/client/v4"
ACCOUNT = os.environ.get("CF_ACCOUNT_ID")
PROJECT = "pmcore"
TOKEN = os.environ.get("CF_TOKEN")
SITE = os.path.dirname(os.path.abspath(__file__))
BRANCH = "main"

# 需要发布的站点文件：根目录入口 + 术语库 + 整个 src/ 模块树
DEPLOY_ROOT_FILES = ["index.html", "glossary.json"]
DEPLOY_DIRS = ["src"]


def collect_files():
    files = []
    for name in DEPLOY_ROOT_FILES:
        files.append(os.path.join(SITE, name))
    for d in DEPLOY_DIRS:
        for dirpath, dirnames, filenames in os.walk(os.path.join(SITE, d)):
            dirnames[:] = [x for x in dirnames if x not in ("node_modules", "__pycache__")]
            for fn in filenames:
                if fn.startswith("."):
                    continue
                files.append(os.path.join(dirpath, fn))
    return sorted(files)


def rel(path):
    return os.path.relpath(path, SITE)


def req(method, path, token=None, body=None, raw=False, headers=None):
    h = {"Authorization": f"Bearer {token or TOKEN}"}
    if headers:
        h.update(headers)
    data = None
    if body is not None:
        if isinstance(body, (dict, list)):
            data = json.dumps(body).encode()
            h["Content-Type"] = "application/json"
        else:
            data = body
    r = urllib.request.Request(API + path, data=data, method=method, headers=h)
    with urllib.request.urlopen(r, timeout=60) as resp:
        payload = resp.read()
        return payload if raw else json.loads(payload)


def hash_file(path):
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    ext = os.path.splitext(path)[1].lstrip(".")
    return blake3.blake3((b64 + ext).encode()).hexdigest()[:32]


def main():
    if not TOKEN or not ACCOUNT:
        sys.exit("请先设置环境变量 CF_TOKEN 与 CF_ACCOUNT_ID（见文件顶部说明）")

    files = []
    for p in collect_files():
        files.append({
            "name": rel(p),
            "path": p,
            "hash": hash_file(p),
            "size": os.path.getsize(p),
            "ctype": mimetypes.guess_type(p)[0] or "application/octet-stream",
        })
    print(f"files: {len(files)} 个，共 {sum(f['size'] for f in files)} 字节")

    # 1) upload-token (JWT)
    jwt = req("GET", f"/accounts/{ACCOUNT}/pages/projects/{PROJECT}/upload-token")["result"]["jwt"]
    print("got upload JWT")

    # 2) check-missing
    missing = req("POST", "/pages/assets/check-missing", token=jwt,
                  body={"hashes": [f["hash"] for f in files]})["result"]
    print("missing hashes:", len(missing))

    # 3) upload missing files
    if missing:
        payload = [{
            "key": f["hash"],
            "value": base64.b64encode(open(f["path"], "rb").read()).decode(),
            "metadata": {"contentType": f["ctype"]},
            "base64": True,
        } for f in files if f["hash"] in missing]
        req("POST", "/pages/assets/upload", token=jwt, body=payload)
        print(f"uploaded {len(payload)} files")

    # 4) upsert-hashes
    req("POST", "/pages/assets/upsert-hashes", token=jwt,
        body={"hashes": [f["hash"] for f in files]})
    print("hashes registered")

    # 5) create deployment (multipart)
    manifest = json.dumps({"/" + f["name"]: f["hash"] for f in files})
    boundary = "----pmhubBoundary7d4f2a"
    parts = []

    def field(name, value):
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())

    field("manifest", manifest)
    field("branch", BRANCH)
    parts.append(f"--{boundary}--\r\n".encode())
    body = b"".join(parts)
    dep = req("POST", f"/accounts/{ACCOUNT}/pages/projects/{PROJECT}/deployments",
              body=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})["result"]
    dep_id, dep_url = dep["id"], dep["url"]
    print("deployment created:", dep_id, dep_url)

    # 6) poll status
    for i in range(12):
        time.sleep(min(2 ** i, 15))
        d = req("GET", f"/accounts/{ACCOUNT}/pages/projects/{PROJECT}/deployments/{dep_id}")["result"]
        stage = d.get("latest_stage") or {}
        print(f"  [{i}] stage={stage.get('name')} status={stage.get('status')}")
        if stage.get("name") == "deploy" and stage.get("status") == "success":
            print("DEPLOY SUCCESS:", dep_url)
            return
        if stage.get("status") == "failure":
            print("DEPLOY FAILED")
            sys.exit(1)
    print("DEPLOY status unknown, check dashboard:", dep_url)


main()
