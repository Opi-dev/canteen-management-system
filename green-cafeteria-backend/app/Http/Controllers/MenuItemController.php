<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuItemController extends Controller
{
    // 🔹 সব Menu আইটেম দেখাও
    public function index()
    {
        return response()->json(MenuItem::all());
    }

    // 🔹 নতুন Menu আইটেম তৈরি করো (image + stock সহ)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'category' => 'required|string|max:100',
            'stock_quantity' => 'nullable|numeric',
            'description' => 'nullable|string',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $menuItem = new MenuItem($validated);

        // ✅ Image Upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('menu_images', 'public');
            $menuItem->image = $path;
        }

        $menuItem->is_available = 1;
        $menuItem->save();

        return response()->json($menuItem, 201);
    }

    // 🔹 নির্দিষ্ট Menu আইটেম দেখাও
    public function show(MenuItem $menuItem)
    {
        return response()->json($menuItem);
    }

    // 🔹 Menu আইটেম আপডেট করো
    public function update(Request $request, MenuItem $menuItem)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric',
            'category' => 'sometimes|required|string|max:100',
            'stock_quantity' => 'nullable|numeric',
            'description' => 'nullable|string',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // 🔸 পুরনো image থাকলে delete করো এবং নতুন সেভ করো
        if ($request->hasFile('image')) {
            if ($menuItem->image && Storage::disk('public')->exists($menuItem->image)) {
                Storage::disk('public')->delete($menuItem->image);
            }
            $path = $request->file('image')->store('menu_images', 'public');
            $menuItem->image = $path;
        }

        // 🔸 Update ফিল্ডগুলো
        $menuItem->name = $request->input('name', $menuItem->name);
        $menuItem->price = $request->input('price', $menuItem->price);
        $menuItem->category = $request->input('category', $menuItem->category);
        $menuItem->stock_quantity = $request->input('stock_quantity', $menuItem->stock_quantity);
        $menuItem->description = $request->input('description', $menuItem->description);

        $menuItem->save();

        return response()->json([
            'message' => '✅ Menu updated successfully',
            'menu' => $menuItem
        ]);
    }

    // 🔹 Menu আইটেম ডিলিট করো
    public function destroy(MenuItem $menuItem)
    {
        if ($menuItem->image && Storage::disk('public')->exists($menuItem->image)) {
            Storage::disk('public')->delete($menuItem->image);
        }

        $menuItem->delete();

        return response()->json(['message' => '✅ Menu item deleted successfully']);
    }

    // ✅ Stock update method
    public function updateStock(Request $request, $id)
    {
        $request->validate([
            'stock_quantity' => 'required|numeric|min:0',
            'is_available' => 'boolean'
        ]);

        $menuItem = MenuItem::findOrFail($id);
        $menuItem->stock_quantity = $request->stock_quantity;
        $menuItem->is_available = $request->is_available ?? 1;
        $menuItem->save();

        return response()->json([
            'message' => '✅ Stock updated successfully',
            'item' => $menuItem
        ]);
    }

    // ✅ Toggle Availability method
    public function updateAvailability(Request $request, $id)
    {
        $request->validate([
            'is_available' => 'required|boolean'
        ]);

        $menuItem = MenuItem::findOrFail($id);
        $menuItem->is_available = $request->is_available;
        $menuItem->save();

        return response()->json([
            'message' => '✅ Availability status updated successfully',
            'item' => $menuItem
        ]);
    }
}
