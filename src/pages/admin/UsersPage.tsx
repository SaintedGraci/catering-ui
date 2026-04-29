import { useState, useEffect } from "react";
import { authService, type StaffUser } from "@/lib/api";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const PERMISSIONS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "bookings", label: "Bookings" },
  { key: "dishes", label: "Dishes" },
  { key: "menus", label: "Menus" },
  { key: