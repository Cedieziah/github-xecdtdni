import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  Palette,
  Type
} from 'lucide-react';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/theme/ThemeToggle';
import FontSizeControl from '../../components/theme/FontSizeControl';

interface AdminQuickActionsProps {
  onCreateCertification: () => void;
  onManageUsers: () => void;
  onViewReports: () => void;
  onSettings: () => void;
}

const AdminQuickActions: React.FC<AdminQuickActionsProps> = ({
  onCreateCertification,
  onManageUsers,
  onViewReports,
  onSettings
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="ghost" 
          className="h-20 flex-col gap-2 hover:bg-primary-orange/10 hover:text-primary-orange"
          onClick={onCreateCertification}
        >
          <FileText size={24} />
          <span className="text-sm">Certifications</span>
        </Button>
        <Button 
          variant="ghost" 
          className="h-20 flex-col gap-2 hover:bg-robotic-blue/10 hover:text-robotic-blue"
          onClick={onManageUsers}
        >
          <Users size={24} />
          <span className="text-sm">Manage Users</span>
        </Button>
        <Button 
          variant="ghost" 
          className="h-20 flex-col gap-2 hover:bg-robotic-green/10 hover:text-robotic-green"
          onClick={onViewReports}
        >
          <BarChart3 size={24} />
          <span className="text-sm">Reports</span>
        </Button>
        <Button 
          variant="ghost" 
          className="h-20 flex-col gap-2 hover:bg-robotic-purple/10 hover:text-robotic-purple"
          onClick={onSettings}
        >
          <Settings size={24} />
          <span className="text-sm">Settings</span>
        </Button>
      </div>
      
      {/* Theme Controls */}
      <div className="border-t border-primary-gray/30 pt-4">
        <h3 className="text-sm font-medium text-primary-gray mb-3">Quick Theme Controls</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3 p-3 bg-primary-gray/10 rounded-lg">
            <Palette size={18} className="text-primary-orange" />
            <span className="text-sm text-primary-white">Theme:</span>
            <ThemeToggle size="sm" />
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-primary-gray/10 rounded-lg">
            <Type size={18} className="text-robotic-blue" />
            <span className="text-sm text-primary-white">Font Size:</span>
            <FontSizeControl compact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuickActions;