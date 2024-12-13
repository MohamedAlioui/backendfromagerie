import { asyncHandler } from '../../middleware/asyncHandler.js';
import { Product } from '../../models/product.model.js';
import { Order } from '../../models/order.model.js';
import { User } from '../../models/user.model.js';
import { ApiError } from '../../utils/apiError.js';

// Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments(),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' }
        }
      }
    ]),
    Order.find().sort('-createdAt').limit(5).populate('userId', 'name email')
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalProducts: stats[0],
      totalOrders: stats[1],
      totalUsers: stats[2],
      revenue: stats[3][0]?.totalRevenue || 0,
      recentOrders: stats[4]
    }
  });
});

// Get sales analytics
export const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = 'weekly' } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'daily':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.setDate(now.getDate() - 7))
        }
      };
      break;
    case 'monthly':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.setMonth(now.getMonth() - 6))
        }
      };
      break;
    case 'yearly':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.setFullYear(now.getFullYear() - 1))
        }
      };
      break;
  }

  const salesData = await Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: {
          $dateToString: {
            format: period === 'daily' ? '%Y-%m-%d' : '%Y-%m',
            date: '$createdAt'
          }
        },
        sales: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: salesData
  });
});

// Get inventory status
export const getInventoryStatus = asyncHandler(async (req, res) => {
  const lowStockThreshold = 10;

  const inventory = await Product.aggregate([
    {
      $facet: {
        lowStock: [
          { $match: { stock: { $lte: lowStockThreshold } } },
          { $limit: 10 }
        ],
        categoryStats: [
          {
            $group: {
              _id: '$category',
              totalProducts: { $sum: 1 },
              averageStock: { $avg: '$stock' }
            }
          }
        ]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      lowStock: inventory[0].lowStock,
      categoryStats: inventory[0].categoryStats
    }
  });
});

// Get user analytics
export const getUserAnalytics = asyncHandler(async (req, res) => {
  const userStats = await User.aggregate([
    {
      $facet: {
        userGrowth: [
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m', date: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id': 1 } }
        ],
        userTypes: [
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 }
            }
          }
        ]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: userStats[0]
  });
});