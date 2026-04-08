import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Navbar from "../Navbar";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import BASE_URL from "@/constants/api";
import { authFetch } from "@/utils/authFetch";
import Loader from "../../ui/Loader";
import { doctorAvatarUrl, formatSpecialization } from "@/utils/mediaUrl";

dayjs.extend(relativeTime);

export default function DoctorProfile() {
  const navigate = useNavigate();
  const { id: doctorId } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [stories, setStories] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [visitingFor, setVisitingFor] = useState("Consultation");
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  // 🔥 Fetch doctor + stories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, storyRes] = await Promise.all([
          fetch(`${BASE_URL}/doctors/${doctorId}`),
          fetch(`${BASE_URL}/stories/doctor/${doctorId}`),
        ]);

        const docData = await docRes.json();
        const storyData = await storyRes.json();

        setDoctor(docData.data || docData);
        setStories(
          Array.isArray(storyData) ? storyData : storyData?.data || [],
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [doctorId]);

  // 🔥 Fetch slots (requires auth — same as booking)
  useEffect(() => {
    if (!selectedDate || !doctorId) return;

    const fetchSlots = async () => {
      try {
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
        const res = await authFetch(
          `/appointments/slots/${doctorId}/${formattedDate}`,
          { method: "GET" },
        );
        const data = await res.json();
        const list = data.data?.slots || data.slots || [];
        setSlots(list);
      } catch (err) {
        console.error(err);
        setSlots([]);
      }
    };

    fetchSlots();
  }, [selectedDate, doctorId]);

  // 🔥 BOOK APPOINTMENT
  const handleConfirmAppointment = async () => {
    if (!selectedSlot) {
      toast({
        title: "Select Slot",
        description: "Please select a time slot",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await authFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId,
          notes: visitingFor,
          date: dayjs(selectedDate).format("YYYY-MM-DD"),
          slot: selectedSlot,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Appointment Booked ✅",
          description: `${doctor.fullname} | ${selectedSlot}`,
        });

        const apptId = data.appointmentId || data.data?._id;
        if (apptId) navigate(`/video?roomID=${apptId}`);
        else navigate("/doctor-search");
      } else {
        toast({
          title: "Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setShowDialog(false);
    }
  };

  // 🔥 JOIN CALL
  const handleJoin = () => {
    navigate(`/video?roomID=${doctorId}`);
  };

  if (!doctor) return <Loader />;

  return (
    <>
      <Navbar />

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT - DOCTOR INFO */}
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="h-28 w-28 mx-auto mb-4">
                <AvatarImage src={doctorAvatarUrl(doctor)} />
                <AvatarFallback>{doctor.fullname?.slice(0, 2)}</AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-bold">{doctor.fullname}</h2>
              <p className="text-gray-500">
                {formatSpecialization(doctor.specialization)}
              </p>

              <div className="flex justify-center mt-2">⭐⭐⭐⭐⭐</div>

              <p className="text-sm text-gray-500 mt-2">
                {doctor.experience}+ years experience
              </p>

              <p className="mt-4 text-sm text-gray-600">{doctor.description}</p>
            </CardContent>
          </Card>

          {/* RIGHT */}
          <div className="md:col-span-2">
            <Tabs defaultValue="appointments">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="stories">Stories</TabsTrigger>
              </TabsList>

              {/* APPOINTMENT TAB */}
              <TabsContent value="appointments">
                <Card>
                  <CardContent className="pt-6">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                    />

                    {/* SLOTS */}
                    <div className="mt-6">
                      {slots.length === 0 && (
                        <p className="text-gray-500">No slots available</p>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        {slots.map(({ startTime, status }) => (
                          <button
                            key={startTime}
                            disabled={status === "booked"}
                            onClick={() => {
                              setSelectedSlot(startTime);
                              setShowDialog(true);
                            }}
                            className={`p-2 border rounded ${
                              status === "booked"
                                ? "bg-gray-200"
                                : selectedSlot === startTime
                                  ? "bg-emerald-600 text-white"
                                  : ""
                            }`}
                          >
                            {status === "mine" ? "Join" : startTime}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DIALOG */}
                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Appointment</DialogTitle>
                        </DialogHeader>

                        <input
                          value={visitingFor}
                          onChange={(e) => setVisitingFor(e.target.value)}
                          className="border p-2 rounded"
                        />

                        <DialogFooter>
                          <Button onClick={() => setShowDialog(false)}>
                            Cancel
                          </Button>

                          <Button
                            onClick={handleConfirmAppointment}
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Confirm"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* STORIES TAB */}
              <TabsContent value="stories">
                <Card>
                  <CardContent className="pt-6">
                    {stories.length === 0 ? (
                      <p>No stories yet</p>
                    ) : (
                      stories.map((s) => (
                        <div key={s._id} className="mb-4 border p-3 rounded">
                          <p className="text-sm">{s.story}</p>
                          <p className="text-xs text-gray-400">
                            {dayjs(s.createdAt).fromNow()}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
