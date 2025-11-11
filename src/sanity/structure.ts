import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Djerba Adventures")
    .items([
      S.listItem()
        .title("Activités")
        .child(
          S.documentTypeList("activity")
            .title("Activités")
            .defaultOrdering([{ field: "name", direction: "asc" }])
        ),
      S.listItem()
        .title("Tours")
        .child(
          S.documentTypeList("tour")
            .title("Tours")
            .defaultOrdering([{ field: "name", direction: "asc" }])
        ),
      S.listItem()
        .title("Transferts")
        .child(
          S.documentTypeList("transfer")
            .title("Transferts")
            .defaultOrdering([{ field: "name", direction: "asc" }])
        ),
    ]);
