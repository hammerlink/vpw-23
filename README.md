# Vlaamse Programmeer Wedstrijd 2023

Teamname: **panic!()**

## Assignments

All assignments (2017-2018), have been placed in the `src/exercises` folder, together with the input-and output files.

## Solving an exercise

When solving an exercise, these steps should be followed

### 1. Select the exercise

- Browse though the `src/exercises` folder and pick your target

### 2. Copy the templates

- Copy the `src/exercises/template.ts` & `template.spec.ts` into the selected exercise folder 
- Give the template files a suitable name.

E.g. exercise **duitse-tanks**

- Folder name: `src/exercises/2017/cat2/duitse-tanks`
- File names: `duitse-tanks.spec.ts` & `duitse-tanks.ts`

### 3. Rename the templateHandler values

-  Rename all the occurences of `templateHandler` in the template files with a suiting name

### 4. Test your solution

- The `template.spec.ts` file contains 2 tests, one to check the example input and one for the competition input.

## Uploading an exercise

Run `npm run build` in the root folder, this will generate `.js` files in the `dist` folder (the same folder structure as src will be respected).

Upload your file to https://www.vlaamseprogrammeerwedstrijd.be/2/team/websubmit.php

## Using libraries

You can perfectly use lodash or any other (self made) libraries.
Es build will take your library and bundle it into the dist files.
