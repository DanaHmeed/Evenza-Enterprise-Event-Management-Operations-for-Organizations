
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  avatar: 'avatar',
  bio: 'bio',
  isActive: 'isActive',
  phone: 'phone',
  experience: 'experience',
  industry: 'industry',
  jobTitle: 'jobTitle',
  location: 'location',
  organization: 'organization'
};

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  organizerId: 'organizerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  address: 'address',
  capacity: 'capacity',
  city: 'city',
  currency: 'currency',
  endDate: 'endDate',
  eventType: 'eventType',
  isOnline: 'isOnline',
  price: 'price',
  seatsRemaining: 'seatsRemaining',
  startDate: 'startDate',
  status: 'status',
  timezone: 'timezone',
  venueName: 'venueName',
  approvalRequired: 'approvalRequired',
  banner: 'banner',
  country: 'country',
  meetingLink: 'meetingLink',
  registrationDeadline: 'registrationDeadline',
  cancelReason: 'cancelReason',
  cancelledAt: 'cancelledAt',
  categoryId: 'categoryId',
  gallery: 'gallery',
  isFeatured: 'isFeatured',
  latitude: 'latitude',
  longitude: 'longitude',
  publishedAt: 'publishedAt',
  slug: 'slug',
  summary: 'summary',
  videoUrl: 'videoUrl',
  viewCount: 'viewCount',
  waitlistEnabled: 'waitlistEnabled'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  icon: 'icon',
  color: 'color',
  createdAt: 'createdAt'
};

exports.Prisma.TagScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  createdAt: 'createdAt'
};

exports.Prisma.RegistrationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventId: 'eventId',
  status: 'status',
  createdAt: 'createdAt',
  checkedIn: 'checkedIn',
  checkedInAt: 'checkedInAt',
  notes: 'notes',
  source: 'source',
  updatedAt: 'updatedAt'
};

exports.Prisma.TicketScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  userId: 'userId',
  price: 'price',
  currency: 'currency',
  status: 'status',
  createdAt: 'createdAt',
  isUsed: 'isUsed',
  usedAt: 'usedAt',
  paymentIntentId: 'paymentIntentId',
  ticketNumber: 'ticketNumber',
  qrCode: 'qrCode',
  registrationId: 'registrationId',
  updatedAt: 'updatedAt',
  validatedBy: 'validatedBy'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventId: 'eventId',
  amount: 'amount',
  currency: 'currency',
  paymentMethod: 'paymentMethod',
  paymentStatus: 'paymentStatus',
  stripeSessionId: 'stripeSessionId',
  createdAt: 'createdAt',
  receiptUrl: 'receiptUrl',
  refundAmount: 'refundAmount',
  refundedAt: 'refundedAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeedbackScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventId: 'eventId',
  rating: 'rating',
  comment: 'comment',
  createdAt: 'createdAt',
  moderatedAt: 'moderatedAt',
  moderatedBy: 'moderatedBy',
  rejectReason: 'rejectReason',
  status: 'status',
  title: 'title',
  updatedAt: 'updatedAt'
};

exports.Prisma.WaitlistEntryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventId: 'eventId',
  position: 'position',
  notifiedAt: 'notifiedAt',
  expiredAt: 'expiredAt',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  link: 'link',
  isRead: 'isRead',
  readAt: 'readAt',
  createdAt: 'createdAt'
};

exports.Prisma.ContactMessageScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  subject: 'subject',
  message: 'message',
  isRead: 'isRead',
  repliedAt: 'repliedAt',
  repliedBy: 'repliedBy',
  createdAt: 'createdAt'
};

exports.Prisma.PlatformSettingScalarFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  type: 'type',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  actorId: 'actorId',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  metadata: 'metadata',
  ipAddress: 'ipAddress',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  USER: 'USER',
  ORGANIZER: 'ORGANIZER',
  ADMIN: 'ADMIN'
};

exports.EventType = exports.$Enums.EventType = {
  FREE: 'FREE',
  PAID: 'PAID'
};

exports.EventStatus = exports.$Enums.EventStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};

exports.RegistrationStatus = exports.$Enums.RegistrationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

exports.TicketStatus = exports.$Enums.TicketStatus = {
  RESERVED: 'RESERVED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  EXPIRED: 'EXPIRED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  STRIPE: 'STRIPE',
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  JAWWAL_PAY: 'JAWWAL_PAY'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

exports.FeedbackStatus = exports.$Enums.FeedbackStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.WaitlistStatus = exports.$Enums.WaitlistStatus = {
  WAITING: 'WAITING',
  NOTIFIED: 'NOTIFIED',
  EXPIRED: 'EXPIRED',
  CONVERTED: 'CONVERTED'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  REGISTRATION_CONFIRMED: 'REGISTRATION_CONFIRMED',
  REGISTRATION_APPROVED: 'REGISTRATION_APPROVED',
  REGISTRATION_REJECTED: 'REGISTRATION_REJECTED',
  EVENT_REMINDER: 'EVENT_REMINDER',
  EVENT_CANCELLED: 'EVENT_CANCELLED',
  EVENT_UPDATED: 'EVENT_UPDATED',
  WAITLIST_SPOT_AVAILABLE: 'WAITLIST_SPOT_AVAILABLE',
  FEEDBACK_APPROVED: 'FEEDBACK_APPROVED',
  FEEDBACK_REJECTED: 'FEEDBACK_REJECTED',
  TICKET_ISSUED: 'TICKET_ISSUED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT'
};

exports.Prisma.ModelName = {
  User: 'User',
  Event: 'Event',
  Category: 'Category',
  Tag: 'Tag',
  Registration: 'Registration',
  Ticket: 'Ticket',
  Order: 'Order',
  Feedback: 'Feedback',
  WaitlistEntry: 'WaitlistEntry',
  Notification: 'Notification',
  ContactMessage: 'ContactMessage',
  PlatformSetting: 'PlatformSetting',
  AuditLog: 'AuditLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
