import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { Notification } from '../../modules/notification/notification.model';
import QueryBuilder from '../../builder/QueryBuilder'; // Adjust path accordingly

const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Start base query to find notifications of this user
    let baseQuery = Notification.find({ userId });

    // Build query with your QueryBuilder
    const queryBuilder = new QueryBuilder(baseQuery, req.query)
      .search(['title', 'message', 'type']) // example searchable fields
      .filter()
      .sort()
      .paginate()
      .fields();

    // Execute the query to get results
    const notifications = await queryBuilder.modelQuery.lean();

    // Get pagination info
    const meta = await queryBuilder.countTotal();

    res.status(httpStatus.OK).json({
      success: true,
      data: notifications,
      meta,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch notifications',
    });
  }
};

export { getNotifications };
