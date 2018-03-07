BIN := node_modules/.bin
TYPESCRIPT := $(shell jq -r '.files[]' tsconfig.json | grep -v node_modules)
JAVASCRIPT := $(TYPESCRIPT:%.ts=%.js)

all: $(JAVASCRIPT)

%.js: %.ts $(BIN)/tsc
	$(BIN)/tsc
