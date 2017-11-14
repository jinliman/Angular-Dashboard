// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  serverUrl: 'http://localhost:3001',
  hostUrl: 'http://localhost:4200/',
  adminUrl: 'admin/',
  //Dropbox
  dropbox_appkey: 'kvnozaj9myc68g5',
  //Box
  box_client_id: '6cave3zjr8qcibt0t4pwp5vwg4lrl5pu',
  //Google drive
  gd_developerKey: 'AIzaSyD7MWf-JAJiVZTmWHQ3XzH9A98s5S9aGmU',
  gd_clientId: '677439360312-i40qtil81ls0fkfcrdhe60qm7n80bksq.apps.googleusercontent.com',
  //One drive
  od_appkey: '284457bc-4dab-4de9-ace8-f32888ae2764',
  stripe_publick_key: 'pk_test_LGUc6Wm6OYJHrh5Ts6yOM6iC'
};
