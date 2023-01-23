import { RequestHandler, Router } from "express"
import "reflect-metadata"

import { Product } from "../../../.."
import middlewares, { transformQuery } from "../../../middlewares"
import { PaginatedResponse } from "../../../../types/common"
import { extendRequestParams } from "../../../middlewares/publishable-api-key/extend-request-params"
import { validateProductSalesChannelAssociation } from "../../../middlewares/publishable-api-key/validate-product-sales-channel-association"
import { validateSalesChannelParam } from "../../../middlewares/publishable-api-key/validate-sales-channel-param"
import { StoreGetProductsParams } from "./list-products"

const route = Router()

export default (app) => {
  app.use("/products", route)

  route.use(
    "/",
    extendRequestParams as unknown as RequestHandler,
    validateSalesChannelParam as unknown as RequestHandler
  )
  route.use("/:id", validateProductSalesChannelAssociation)

  route.get(
    "/",
    transformQuery(StoreGetProductsParams, {
      defaultRelations: defaultStoreProductsRelations,
      isList: true,
    }),
    middlewares.wrap(require("./list-products").default)
  )
  route.get("/:id", middlewares.wrap(require("./get-product").default))
  route.post("/search", middlewares.wrap(require("./search").default))

  return app
}

export const defaultStoreProductsRelations = [
  "variants",
  "variants.prices",
  "variants.options",
  "options",
  "options.values",
  "images",
  "tags",
  "collection",
  "type",
]

export * from "./list-products"
export * from "./search"

/**
 * @schema StoreProductsRes
 * type: object
 * properties:
 *   product:
 *     $ref: "#/components/schemas/PricedProduct"
 */
export type StoreProductsRes = {
  product: Product
}

/**
 * @schema StorePostSearchRes
 * type: object
 * properties:
 *   hits:
 *     type: array
 *     description: Array of results. The format of the items depends on the search engine installed on the server.
 */
export type StorePostSearchRes = {
  hits: unknown[]
  [k: string]: unknown
}

/**
 * @schema StoreProductsListRes
 * type: object
 * properties:
 *   products:
 *     type: array
 *     items:
 *       $ref: "#/components/schemas/PricedProduct"
 *   count:
 *     type: integer
 *     description: The total number of items available
 *   offset:
 *     type: integer
 *     description: The number of items skipped before these items
 *   limit:
 *     type: integer
 *     description: The number of items per page
 */
export type StoreProductsListRes = PaginatedResponse & {
  products: Product[]
}
