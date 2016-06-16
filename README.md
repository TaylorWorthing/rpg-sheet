 # RPG Sheet
RPG Sheet is a web-based character sheet tool for role-playing games.

> This project is still under development. There is a chance that changes might
> break existing exported sheets.


### Why use RPG Sheet over a form-fillable PDF or other tools?
Sending PDF's back and forth with players is a major headache. One PDF reader
will format fields one way, another will change font sizes, and there was no
easy way to version control. RPG Sheet exports data to a flat-file as a JSON
object, than can be imported back in. This means your exported character sheet
can be shared, edited, synced with dropbox, or even put in a git repo, all with
a file that will still only be a few KBs.

RPG Sheet itself is also easy to modify. It is static HTML, CSS, JavaScript and
images. You can host it yourself using something as simple as `python -m
SimpleHTTPServer`. You can also create your own sheet modules, or modify
existing ones.


## Contribution
Do you want to add sheet module? Notice some terrible JavaScript or CSS? Have
an improvement or bug-fix? Contributions will gladly be accepted. This should be
a tool for the community, that means your input is important.

## Credits
- **Ploshy** *for concept development and helping with JavaScript.*
- **Atellion** *for debugging CSS issues.*
- Icosahedron by Beatrice Dalla Muta from the Noun Project
