test:
	rm -r ./test/sandbox
	mkdir ./test/sandbox
	node test/test.js

.PHONY: test
