import { EntityRepository, Repository } from "typeorm"

import StripeAccount from "../../../db/entities/stripe-account"

@EntityRepository(StripeAccount)
export default class StripeRepository extends Repository<StripeAccount> {}
