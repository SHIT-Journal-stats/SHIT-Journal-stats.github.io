import subprocess
import datetime

def auto_push(gitdir: str,commit_message=None):
    if commit_message is None:
        commit_message = f"Auto update: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

    subprocess.run(["git", "--git-dir", gitdir, "add", "."], shell=True)
    subprocess.run(["git", "--git-dir", gitdir, "commit", "-m", commit_message], shell=True)
    subprocess.run(["git", "--git-dir", gitdir, "push"], shell=True)

if __name__ == "__main__":
    auto_push()