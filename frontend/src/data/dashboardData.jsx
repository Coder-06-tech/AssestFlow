import {
  Package,
  CheckCircle2,
  Users,
  CalendarDays,
} from "lucide-react";

export const kpiData = [
  {
    title: "Total Assets",
    value: "1,248",
    subtitle: "Across all departments",
    trend: "8%",
    icon: <Package size={22} />,
    color: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Available",
    value: "834",
    subtitle: "Ready for allocation",
    trend: "5%",
    icon: <CheckCircle2 size={22} />,
    color: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Allocated",
    value: "389",
    subtitle: "Currently assigned",
    trend: "3%",
    icon: <Users size={22} />,
    color: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    title: "Active Bookings",
    value: "41",
    subtitle: "Today's reservations",
    trend: "12%",
    icon: <CalendarDays size={22} />,
    color: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];