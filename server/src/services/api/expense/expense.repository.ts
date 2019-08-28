import { EntityRepository, Repository } from "typeorm"

import Expense from "../../../db/entities/expense"

@EntityRepository(Expense)
export default class ExpenseRepository extends Repository<Expense> {}
