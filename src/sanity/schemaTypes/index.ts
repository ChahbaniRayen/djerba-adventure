import { type SchemaTypeDefinition } from "sanity";

import { activityType } from "./activityType";
import { tourType } from "./tourType";
import { transferType } from "./transferType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [activityType, tourType, transferType],
};
