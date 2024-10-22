index.html: .FORCE
	@perl util/build.pl

clean:
	rm -fr static/data/ docs/

deb: debug
debug: set_debug index.html
set_debug: .FORCE
	perl -CDAS -i -pe 's/\b(my\h*\$$js_debug\h*=\h*)[0-9];/$${1}1;/' util/build.pl

rel: release
release: set_release index.html
set_release: .FORCE
	perl -CDAS -i -pe 's/\b(my\h*\$$js_debug\h*=\h*)[0-9];/$${1}0;/' util/build.pl

.FORCE:

.PHONEY: .FORCE clean  rel release set_release  deb debug set_debug
