import Link from "next/link";
import { ShieldAlert, ArrowRight, LayoutDashboard, PlusCircle, Layers } from "lucide-react";
import { Button } from "../ui/button";

export default function NotAuthenticatedScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
        <ShieldAlert className="h-10 w-10 text-blue-500" />
      </div>
      
      <h1 className="text-3xl font-extrabold text-slate-800 mb-4">
        Authentication Required
      </h1>
      
      <p className="text-lg text-slate-500 max-w-md mb-8">
        Please login to continue. Once authenticated, you can create boards, organize your work, and collaborate with your team.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-base py-6" size="lg">
          <Link href="/login">
            Login to Workspace
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full text-base py-6" size="lg">
          <Link href="/signup">
            Create Account
          </Link>
        </Button>
      </div>

      {/* Feature Preview Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl text-left border-t border-slate-200 pt-12">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Visual Workspaces</h3>
          <p className="text-sm text-slate-500">Manage all your projects from a single, unified bird's-eye view.</p>
        </div>
        
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-3">
            <PlusCircle className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Infinite Boards</h3>
          <p className="text-sm text-slate-500">Create limitless kanban boards tailored specifically to your workflow.</p>
        </div>

        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-3">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Organize Work</h3>
          <p className="text-sm text-slate-500">Structure complex tasks intuitively so nothing slips through the cracks.</p>
        </div>
      </div>
    </div>
  );
}
