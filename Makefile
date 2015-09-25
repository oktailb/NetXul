ZIP	=	zip
OPTS	=	-r9
DEST	=	..
VERSION	=	`cat VERSION`
EXT	=	xpi
NAME	=	netxul.$(VERSION).$(EXT)
SRC	=	*
UPDATE	=	netxul-update.rdf
INSTALL	=	install.rdf
CONTENT	=	contents.rdf

all:
	cat ../template_$(INSTALL) | sed s/VERSION/$(VERSION)/ > $(INSTALL)
	cat ../template_$(CONTENT) | sed s/VERSION/$(VERSION)/ > $(CONTENT)
	$(ZIP) $(OPTS) $(NAME) $(SRC)
	rm -f $(DEST)/lastest.xpi
	ln $(NAME) $(DEST)/lastest.xpi
	mv $(NAME) $(DEST)
	cat ../template_$(UPDATE) | sed s/VERSION/$(VERSION)/ > $(UPDATE)
	mv $(UPDATE) $(DEST)

clean:
	rm -f *~
	rm -f *.xpi

re: clean all
