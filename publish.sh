git commit --all -m "update"
git push origin master
npm version patch
npm publish
sudo npm install -g fe-src-builder