JSDIR = src/
BUILTDIR = js/
COMPRESSOR = yuicompressor/yuicompressor-2.4.6.jar
FILENAME = general.js
MINFILENAME = general-min.js

FILES =\
		$(JSDIR)config.js\
		$(JSDIR)main.js\
		$(JSDIR)Views.js\
		$(JSDIR)Controllers.js\
		$(JSDIR)States.js\
		$(JSDIR)Utils.js

all:$(FILES)
	cat $^ > $(BUILTDIR)$(FILENAME)

min: all 
	java -jar $(COMPRESSOR) $(BUILTDIR)$(FILENAME) > $(BUILTDIR)$(MINFILENAME) 
clean:
	rm $(BUILTDIR)$(FILENAME) $(BUILTDIR)$(MINFILENAME)
