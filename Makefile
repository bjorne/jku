test:
	@rm -rf ./test/sandbox
	@mkdir ./test/sandbox
	@node test/test.js

.PHONY: test
