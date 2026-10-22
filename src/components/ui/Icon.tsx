import {
  Factory, Cog, ShieldCheck, BadgeCheck, Award, Flame, Droplets, PaintRoller, Ruler, DraftingCompass,
  Layers, Boxes, Container, Package, Truck, Ship, TrainFront, Zap, BatteryCharging, Wind, Wrench, HardHat,
  Gauge, Cpu, Scissors, ClipboardCheck, Microscope, Users, Handshake, Globe, MapPin, Clock, Target, Eye,
  Lightbulb, TrendingUp, Warehouse, GraduationCap, Heart, CircleCheck, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  factory: Factory, cog: Cog, shield: ShieldCheck, badge: BadgeCheck, award: Award, flame: Flame,
  droplets: Droplets, paint: PaintRoller, ruler: Ruler, compass: DraftingCompass, layers: Layers,
  boxes: Boxes, container: Container, package: Package, truck: Truck, ship: Ship, train: TrainFront,
  zap: Zap, battery: BatteryCharging, wind: Wind, wrench: Wrench, hardhat: HardHat, gauge: Gauge,
  cpu: Cpu, scissors: Scissors, clipboard: ClipboardCheck, microscope: Microscope, users: Users,
  handshake: Handshake, globe: Globe, pin: MapPin, clock: Clock, target: Target, eye: Eye,
  lightbulb: Lightbulb, trending: TrendingUp, warehouse: Warehouse, graduation: GraduationCap,
  heart: Heart, check: CircleCheck,
};

export function Icon({ name, className, strokeWidth = 1.6 }: { name?: string; className?: string; strokeWidth?: number }) {
  const C = (name && ICONS[name]) || CircleCheck;
  return <C className={className} strokeWidth={strokeWidth} aria-hidden />;
}
