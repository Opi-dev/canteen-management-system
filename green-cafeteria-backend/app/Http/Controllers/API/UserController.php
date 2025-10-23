<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // 🔹 সব ইউজার লিস্ট দেখাও
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
                    ->whereIn('role', ['manager', 'staff'])
                    ->get();

        return response()->json($users);
    }

    // 🔹 নতুন ইউজার তৈরি করো
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => ['required', Rule::in(['manager', 'staff'])],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'message' => '✅ User created successfully!',
            'user' => $user,
        ], 201);
    }

    // 🔹 ইউজার আপডেট করো
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => ['sometimes', Rule::in(['manager', 'staff'])],
            'password' => 'nullable|min:6',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => '✅ User updated successfully!',
            'user' => $user,
        ]);
    }

    // 🔹 ইউজার ডিলিট করো
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => '🗑️ User deleted successfully!']);
    }
}
