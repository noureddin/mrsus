index.html: .FORCE
	@perl util/build.pl

clean:
	rm -fr static/data/ docs/

.FORCE:

.PHONEY: .FORCE clean
