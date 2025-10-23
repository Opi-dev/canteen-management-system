<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // ✅ All Orders List
    public function index()
    {
        return response()->json(Order::with('items.menuItem')->get());
    }

    // ✅ Store New Order
    public function store(Request $request)
    {
        try {
            $request->validate([
                'customer_name' => 'required|string|max:255',
                'total_price' => 'required|numeric',
                'payment_method' => 'required|string',
                'items' => 'required|array|min:1',
                'items.*.menu_item_id' => 'required|integer|exists:menu_items,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
            ]);

            // ✅ Generate Voucher
            $voucher = strtoupper(Str::random(8));

            // ✅ Create Order
            $order = Order::create([
                'customer_name' => $request->customer_name,
                'total_price' => $request->total_price,
                'payment_method' => $request->payment_method,
                'voucher_code' => $voucher,
                'status' => 'pending',
            ]);

            // ✅ Insert Order Items
            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            return response()->json([
                'message' => 'Order created successfully',
                'voucher_code' => $voucher,
                'order' => $order->load('items.menuItem'),
            ], 201);

        } catch (\Exception $e) {
            Log::error('Order creation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Internal Server Error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ✅ Update Order (Status Update)
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'nullable|string|in:pending,completed,cancelled',
        ]);

        if (isset($validated['status'])) {
            $order->status = $validated['status'];
            $order->save();
        }

        return response()->json([
            'message' => 'Order updated successfully',
            'order' => $order
        ]);
    }

    // ✅ Generate PDF Voucher
    public function generateVoucher($id)
    {
        $order = Order::with('items.menuItem')->findOrFail($id);
        $pdf = Pdf::loadView('voucher', compact('order'));
        $filename = 'voucher_' . $order->voucher_code . '.pdf';
        return $pdf->stream($filename);
    }

    // ✅ Daily Sales Report
    public function dailyReport()
    {
        $today = Carbon::today();

        $sales = Order::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->sum('total_price');

        $orders = Order::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->count();

        return response()->json([
            'date' => $today->toDateString(),
            'total_sales' => $sales,
            'total_orders' => $orders,
        ]);
    }

    // ✅ Monthly Sales Report
    public function monthlyReport()
    {
        $month = Carbon::now()->month;
        $year = Carbon::now()->year;

        $sales = Order::whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->where('status', 'completed')
            ->sum('total_price');

        $dailySales = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total_price) as total')
        )
            ->whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->where('status', 'completed')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'month' => Carbon::now()->format('F Y'),
            'total_sales' => $sales,
            'daily_sales' => $dailySales,
        ]);
    }
}
