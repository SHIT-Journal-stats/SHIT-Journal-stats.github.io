D:
cd "D:\meow\SHIT-preprints-metrics-history\"
git add "./src"
git commit -m %1
for /l %%a in (0,0,1) do (echo %%a----------------------- && git push && goto :EOF; sleep 5)