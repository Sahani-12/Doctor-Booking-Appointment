import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";

interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: string;
  budget: string;
}

const defaultRecords: Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Rahul Verma",
      role: "Patient",
    },
    projectName: "General Checkup",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "₹3,900",
    status: "Under Treatment",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Aarav Sharma",
      role: "Patient",
    },
    projectName: "Orthopedic Consultation",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "₹24,900",
    status: "Pending",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Mira Patel",
      role: "Patient",
    },
    projectName: "Cardiology Checkup",
    team: {
      images: ["/images/user/user-27.jpg"],
    },
    budget: "₹12,700",
    status: "Under Treatment",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Rohan Das",
      role: "Patient",
    },
    projectName: "Physiotherapy",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "₹2,800",
    status: "Cancelled",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Priya Singh",
      role: "Patient",
    },
    projectName: "Dermatology Treatment",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "₹4,500",
    status: "Under Treatment",
  },
];

export default function BasicTableOne() {
  const [records, setRecords] = useState<Order[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("patientRecords");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as any[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecords(
            parsed.map((item) => ({
              id: item.id,
              user: {
                image: "/images/user/user-17.jpg",
                name: item.name || "Unnamed Patient",
                role: "Patient",
              },
              projectName: item.department || "General Checkup",
              team: { images: [] },
              status: item.status || "Scheduled",
              budget: item.budget || "N/A",
            })),
          );
          return;
        }
      } catch (e) {
        console.error("Failed to parse records", e);
      }
    }
    setRecords(defaultRecords);
  }, []);

  const handleDelete = (id: number) => {
    const updatedRecords = records.filter((r) => r.id !== id);
    setRecords(updatedRecords);

    const stored = JSON.parse(localStorage.getItem("patientRecords") || "[]");
    if (Array.isArray(stored)) {
      const filtered = stored.filter((entry: any) => entry.id !== id);
      localStorage.setItem("patientRecords", JSON.stringify(filtered));
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Patient
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Treatment Type
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Doctors
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Cost
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {records.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-full">
                      <img
                        width={40}
                        height={40}
                        src={order.user.image}
                        alt={order.user.name}
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.user.name}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {order.user.role}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.projectName}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex -space-x-2">
                    {order.team.images.length
                      ? order.team.images.map((teamImage, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900"
                          >
                            <img
                              width={24}
                              height={24}
                              src={teamImage}
                              alt={`Team member ${index + 1}`}
                              className="w-full size-6"
                            />
                          </div>
                        ))
                      : "-"}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      order.status === "Active"
                        ? "success"
                        : order.status === "Pending"
                          ? "warning"
                          : order.status === "Cancelled"
                            ? "danger"
                            : "secondary"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {order.budget}
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(order.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
