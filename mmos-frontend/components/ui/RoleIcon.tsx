"use client";
import React from "react";
import {
  Crown, ShieldCheck, TrendingUp, FolderKanban, Wrench,
  Calendar, Factory, Cog, ShoppingCart, Boxes,
  CheckCircle2, Award, DollarSign, FileSearch,
} from "lucide-react";
import { RoleKey } from "@/lib/roles";

interface RoleIconProps {
  roleKey?: RoleKey;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function RoleIcon({ roleKey = "director", size = 14, className, style }: RoleIconProps) {
  const props = { size, className, style };

  switch (roleKey) {
    case "director":
      return <Crown {...props} />;
    case "admin":
      return <ShieldCheck {...props} />;
    case "sales":
      return <TrendingUp {...props} />;
    case "project_manager":
      return <FolderKanban {...props} />;
    case "engineering":
      return <Wrench {...props} />;
    case "production_planner":
      return <Calendar {...props} />;
    case "production_manager":
      return <Factory {...props} />;
    case "operator":
      return <Cog {...props} />;
    case "procurement":
      return <ShoppingCart {...props} />;
    case "warehouse":
      return <Boxes {...props} />;
    case "qc_inspector":
      return <CheckCircle2 {...props} />;
    case "quality_manager":
      return <Award {...props} />;
    case "finance":
      return <DollarSign {...props} />;
    case "auditor":
      return <FileSearch {...props} />;
    default:
      return <Crown {...props} />;
  }
}
