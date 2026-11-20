import { makeCrudController } from "./crudController.js";
export default makeCrudController({
  table: "suppliers", id: "supplier_id",
  fields: ["business_name","contact_person","phone","province","address"],
  required: ["business_name","contact_person","phone","province"]
});
