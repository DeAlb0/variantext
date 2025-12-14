
# Example usage of varianText

This example explains how to use variantext.js and at the same time
is an example how to use it. This is done by explaining the option
to use it directly with HTML or with Markdown.

##HTML

in plain HTML you have to create a main-content div and preferably
p sections under it which contain the text.

##Markdown

For Markdown you need a converter from markdown to HTML. After this has
performed the conversion variantext must be executed by calling the
processVariants function. See mdshow.html as example ##

In your text you can use the double hash '# #' appended with the variant
or release name. At the end of the variant specific part you can either
start the description of another variant specific part or close the variant specific part by entering double hash without any name.

##Markdown

In Markdown you must take care not to have the double hash without any keyword on the beginning of the line as this is the heading2 token for
markdown and will be used an eliminated already by the markdown processor.

