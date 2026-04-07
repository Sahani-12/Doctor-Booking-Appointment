import { FormEvent, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { CalenderIcon, EyeCloseIcon, EyeIcon, TimeIcon } from "../../../icons";
import Flatpickr from "react-flatpickr";

export default function MedicalInputs() {
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    department: "cardiology",
    password: "",
    dateOfBirth: "",
    appointmentTime: "",
    mrn: "",
  });

  const departments = [
    { value: "cardiology", label: "Cardiology" },
    { value: "neurology", label: "Neurology" },
    { value: "orthopedics", label: "Orthopedics" },
    { value: "pediatrics", label: "Pediatrics" },
  ];

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, department: value }));
  };

  const handleDateChange = (date: Date[]) => {
    const value = date[0] ? date[0].toLocaleDateString() : "";
    setFormData((prev) => ({ ...prev, dateOfBirth: value }));
  };

  const resetForm = () => {
    setFormData({
      patientName: "",
      email: "",
      department: "cardiology",
      password: "",
      dateOfBirth: "",
      appointmentTime: "",
      mrn: "",
    });
  };

  const saveRecord = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newRecord = {
      id: Date.now(),
      name: formData.patientName,
      email: formData.email,
      department: formData.department,
      dateOfBirth: formData.dateOfBirth,
      appointmentTime: formData.appointmentTime,
      mrn: formData.mrn,
      status: "Scheduled",
    };

    const existingRecords = JSON.parse(
      localStorage.getItem("patientRecords") || "[]",
    );
    const updated = [newRecord, ...existingRecords];
    localStorage.setItem("patientRecords", JSON.stringify(updated));

    setSuccessMessage("Patient record saved successfully");
    resetForm();

    setTimeout(() => setSuccessMessage(""), 2500);
  };

  return (
    <ComponentCard title="Patient Information Form">
      <form onSubmit={saveRecord} className="space-y-6">
        <div>
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            type="text"
            id="patientName"
            placeholder="Enter full name"
            value={formData.patientName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, patientName: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="patient@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <Label>Department</Label>
          <Select
            options={departments}
            value={formData.department}
            placeholder="Select a department"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
        </div>

        <div>
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <div className="relative w-full flatpickr-wrapper">
            <Flatpickr
              value={formData.dateOfBirth}
              onChange={handleDateChange}
              options={{ dateFormat: "Y-m-d" }}
              placeholder="Select Date of Birth"
              className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none dark:bg-gray-900 dark:text-white"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <CalenderIcon className="size-6" />
            </span>
          </div>
        </div>

        <div>
          <Label htmlFor="appointmentTime">Appointment Time</Label>
          <div className="relative">
            <Input
              type="time"
              id="appointmentTime"
              value={formData.appointmentTime}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  appointmentTime: e.target.value,
                }))
              }
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <TimeIcon className="size-6" />
            </span>
          </div>
        </div>

        <div>
          <Label htmlFor="mrn">Medical Record Number (MRN)</Label>
          <Input
            type="text"
            id="mrn"
            placeholder="Enter MRN"
            className="pl-4"
            value={formData.mrn}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, mrn: e.target.value }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="rounded-lg bg-orange-500 text-white px-4 py-2 font-medium hover:bg-orange-600"
          >
            Save Patient Record
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={resetForm}
          >
            Clear
          </button>
        </div>

        {successMessage && (
          <div className="rounded-lg bg-green-100 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}
      </form>
    </ComponentCard>
  );
}
