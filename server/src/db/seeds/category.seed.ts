import { getManager, Repository } from "typeorm"

import Category from "../entities/category"
import { SUBCATEGORIES_ICONS } from "./icons"
import Addition from "../entities/addition"
import Subcategory from "../entities/subcategory"

interface CategoryNode {
    name: string
    additions?: Addition[]
    minPrice?: number
    maxPrice?: number
}

interface Tree<T> {
    parent: T
    children: T[]
}

const CLEANING: Tree<CategoryNode> = {
    parent: {
        name: "Cleaning"
    },
    children: [
        {
            name: "Farm",
            minPrice: 234.2,
            maxPrice: 500
        },
        {
            name: "Gutter cleaning",
            minPrice: 123.5,
            maxPrice: 500
        },
        {
            name: "Home",
            minPrice: 434.2,
            maxPrice: 500
        },
        {
            name: "Office",
            minPrice: 56.23,
            maxPrice: 500
        },
        {
            name: "Pool",
            minPrice: 78.54,
            maxPrice: 500
        },
        {
            name: "Window washing",
            minPrice: 34.8,
            maxPrice: 500
        },
        {
            name: "Yard",
            minPrice: 234.2,
            maxPrice: 500
        }
    ]
}

const GENERAL_HELP: Tree<CategoryNode> = {
    parent: {
        name: "General Help"
    },
    children: [
        {
            name: "General Worker",
            minPrice: 16,
            maxPrice: 20
        },
        {
            name: "Packing and Unpacking service",
            minPrice: 50,
            maxPrice: 70
        },
        {
            name: "Professional Organizer",
            minPrice: 50,
            maxPrice: 70
        }
    ]
}

const HANDYMAN: Tree<CategoryNode> = {
    parent: {
        name: "Handyman"
    },
    children: [
        {
            name: "Electrician",
            minPrice: 80,
            maxPrice: 100
        },
        {
            name: "Furniture Assembler",
            minPrice: 60,
            maxPrice: 80
        },
        {
            name: "Graffiti removal",
            minPrice: 80,
            maxPrice: 100
        },
        {
            name: "Plumber",
            minPrice: 100,
            maxPrice: 120
        }
    ]
}

const PETS: Tree<CategoryNode> = {
    parent: {
        name: "Pets"
    },
    children: [
        {
            name: "Dog Walker",
            minPrice: 100,
            maxPrice: 120
        },
        {
            name: "Pet grooming",
            minPrice: 10,
            maxPrice: 20
        },
        {
            name: "Pet sitting",
            minPrice: 10,
            maxPrice: 20
        }
    ]
}

const SECURITY: Tree<CategoryNode> = {
    parent: {
        name: "Security"
    },
    children: [
        {
            name: "Locksmith",
            minPrice: 80,
            maxPrice: 100
        },
        {
            name: "Security Guard",
            minPrice: 20,
            maxPrice: 28
        }
    ]
}

const TRANSPORT_SERVICES: Tree<CategoryNode> = {
    parent: {
        name: "Transport Services"
    },
    children: [
        {
            name: "Transport Towing",
            minPrice: 234.2,
            maxPrice: 500
        }
    ]
}

const WELLNESS_BEAUTY: Tree<CategoryNode> = {
    parent: {
        name: "Wellness & Beauty"
    },
    children: [
        {
            name: "Make-Up artist",
            minPrice: 60,
            maxPrice: 80
        },
        {
            name: "Manicure / Pedicure Specialist",
            minPrice: 35,
            maxPrice: 50
        },
        {
            name: "Marijuana delivery",
            minPrice: 56.23,
            maxPrice: 500
        },
        {
            name: "Massage Therapist",
            minPrice: 60,
            maxPrice: 70
        }
    ]
}

const categories: Array<Tree<CategoryNode>> = [
    CLEANING,
    GENERAL_HELP,
    HANDYMAN,
    PETS,
    SECURITY,
    TRANSPORT_SERVICES,
    WELLNESS_BEAUTY
]

const seedCategory = async (
    categoryTree: Tree<CategoryNode>,
    categoryRepository: Repository<Category>,
    subcategoryRepository: Repository<Subcategory>
): Promise<void> => {
    const { parent, children } = categoryTree
    const category = new Category(parent.name)
    await categoryRepository.save(category)
    for (const child of children) {
        const icon: { base64: string; name: string } = SUBCATEGORIES_ICONS.find(ic => ic.name === child.name)
        const subCategory = new Subcategory(child.name, child.minPrice, child.maxPrice, icon.base64, category)
        subCategory.additions = child.additions
        await subcategoryRepository.save(subCategory)
    }
}

export const seedCategories = async (): Promise<void> => {
    const categoryRepository: Repository<Category> = getManager().getRepository(Category)
    const subcategoryRepository: Repository<Subcategory> = getManager().getRepository(Subcategory)
    if ((await categoryRepository.count()) === 0) {
        for (const category of categories) {
            await seedCategory(category, categoryRepository, subcategoryRepository)
        }
    }
}
