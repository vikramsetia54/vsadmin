import connectToDB from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { AddCategory } from "@/components/categories/AddCategory";

export default async function CategoriesPage() {
  await connectToDB();
  const rawCategories = await Category.find().lean() as any[];

  const productCounts = await Promise.all(
    rawCategories.map((cat: any) => Product.countDocuments({ categoryId: cat._id }))
  );

  const categories = JSON.parse(JSON.stringify(rawCategories));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Categories</h1>
          <p className="text-sm text-slate-400 mt-0.5">{categories.length} organized categories</p>
        </div>
        <AddCategory />
      </div>

      {categories.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat: any, idx: number) => (
            <CategoryCard
              key={cat._id.toString()}
              category={{
                _id: cat._id.toString(),
                label: cat.label,
                name: cat.name,
                description: cat.description,
                productCount: productCounts[idx],
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-[11px] font-bold text-slate-300">
          No categories found.
        </div>
      )}
    </div>
  );
}
