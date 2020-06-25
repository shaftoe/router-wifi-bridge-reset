bump-dependencies:
	@ncu -u
	@npm install
	@git commit -m 'Bump puppeteer-core and dependencies' package*
