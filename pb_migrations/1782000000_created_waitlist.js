/// <reference path="../pb_data/types.d.ts" />

// Creates the "waitlist" collection — the live table (spreadsheet) that
// stores email sign-ups from the landing-page form.
//
// API rules:
//   createRule: ""  -> anyone can submit (the public form posts anonymously)
//   list/view/update/delete: null -> superusers only (emails stay private)
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "waitlist",
    listRule: null,
    viewRule: null,
    createRule: "",
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "email",
        type: "email",
        required: true,
      },
      {
        name: "source",
        type: "text",
        required: false,
        max: 200,
      },
      {
        name: "created",
        type: "autodate",
        onCreate: true,
        onUpdate: false,
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_waitlist_email` ON `waitlist` (`email`)",
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("waitlist");
  app.delete(collection);
});
