from fastapi import APIRouter, HTTPException
from app.models.plan import PlanCreate, PlanOut, PlanUpdate
from app.core import database
from bson import ObjectId

router = APIRouter(prefix="/plans", tags=["plans"])

@router.post("/", response_model=PlanOut)
async def create_plan(plan: PlanCreate):
    existing = await database.db["plans"].find_one({"stripe_price_id": plan.stripe_price_id})
    if existing:
        raise HTTPException(status_code=400, detail="Plan with this stripe_price_id already exists.")

    plan_doc = plan.dict()
    result = await database.db["plans"].insert_one(plan_doc)

    created_plan = await database.db["plans"].find_one({"_id": result.inserted_id})
    created_plan["_id"] = str(created_plan["_id"])

    return PlanOut(**created_plan)

@router.get("/", response_model=list[PlanOut])
async def get_all_plans():
    plans = await database.db["plans"].find().to_list(100)
    for plan in plans:
        plan["_id"] = str(plan["_id"])
    return [PlanOut(**plan) for plan in plans]

@router.get("/{plan_id}", response_model=PlanOut)
async def get_plan_by_id(plan_id: str):
    plan = await database.db["plans"].find_one({"_id": ObjectId(plan_id)})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    plan["_id"] = str(plan["_id"])
    return PlanOut(**plan)

@router.patch("/{plan_id}", response_model=PlanOut)
async def update_plan(plan_id: str, update: PlanUpdate):
    update_doc = {k: v for k, v in update.dict(exclude_unset=True).items()}
    result = await database.db["plans"].update_one({"_id": ObjectId(plan_id)}, {"$set": update_doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    plan = await database.db["plans"].find_one({"_id": ObjectId(plan_id)})
    plan["_id"] = str(plan["_id"])
    return PlanOut(**plan)


@router.delete("/{plan_id}", status_code=204)
async def delete_plan(plan_id: str):
    result = await database.db["plans"].delete_one({"_id": ObjectId(plan_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")

