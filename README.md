# Vlaamse Programmeer Wedstrijd 2023

Teamname: panic!()

## Starting an exercise

All the assignments (2017 - 2018), input, output have been placed in the src/exercises folder.

1. Select the exercise
Browse though the exercise folder and pick your target
2. Copy the templates
Copy the src/exercises/template.ts & template.spec.ts in to the selected exercise folder.
Replace the 'template' with something suitable.
3. Rename the templateHandler values
Rename all the occurences of templateHandler in those files with a suiting name of your choice.
4. Test your solution
The spec file contains 2 tests, one to check the example input and one for the competition input.

## Uploading an exercise
Run `npm run build` in the root folder, this will generate .js files in the dist folder (the same folder structure as src will be respected).

Upload your file on `https://www.vlaamseprogrammeerwedstrijd.be/2/team/websubmit.php`

## Using libraries
You can perfectly use lodash or any other (self made) libraries.
Es build will take your library and bundle it into the dist files.
