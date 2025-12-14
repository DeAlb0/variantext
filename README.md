# variantext

have all variant or release specific descriptions in one page and select for which variant or release the documentation should be shown and what the differences are

Variantext allows to document several options or versions of user journeys and select while viewing
which of these variants you want to view with buttons on top of the page.
In addition you can see 2 or more versions at the same time where the text of the specific variants
are highlighted in different colors and a legend shows which color is used for which variant.

The source of the text is a markdown file with special tags which are ##<variant1 name> for
the start of a variant section. Another variant description can start with another ##<variant2 name>.

The text between is assumed to be relevant for all versions from variant1 until excluding and superseeded
by the following text for variant2.
The end of the variant part is indicated by the ending tag ## without a variant name.

Pure HTML or HTML generated from markdown can be used.

See

https://dealb0.github.io/variantext/example.html

https://dealb0.github.io/variantext/mdshow.html

Or the source files like

https://github.com/DeAlb0/variantext/blob/main/example.md

https://github.com/DeAlb0/variantext/blob/main/mdshow.html

## Disclaimer

There is much to do in terms of documentation and extension, fixing.
Regard this a first working version.