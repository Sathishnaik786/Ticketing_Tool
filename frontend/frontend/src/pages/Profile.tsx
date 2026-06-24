import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Building2,
  Briefcase,
  Camera,
  Loader2,
  User,
  Shield,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  Fingerprint,
  Heart,
  Globe
} from 'lucide-react';
import { EmployeeForm } from '@/components/forms/EmployeeForm';
import { CrudModal } from '@/components/modals/CrudModal';
import { useToast } from '@/components/ui/use-toast';
import { employeesApi } from '@/services/api';
import { EmployeeFormData, Employee } from '@/types';
import { staggerContainer, slideUpVariants, scaleInVariants } from '@/animations/motionVariants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function Profile() {
  const { user, isLoading: authLoading, updateProfileImage } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employee, setEmployee] = useState<Employee | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    try {
      const response = await employeesApi.getProfile();
      const emp = response;
      if (emp) {
        setEmployee(emp);
        if (emp.profile_image && emp.profile_image !== user?.profile_image) {
          updateProfileImage(emp.profile_image);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: 'Error',
        description: 'Failed to synchronize identity profile',
        variant: 'destructive',
      });
    }
  }, [user, updateProfileImage, toast]);

  useEffect(() => {
    if (user && !authLoading && !employee) {
      fetchProfileData();
    }
  }, [user?.id, authLoading, employee, fetchProfileData]);

  const handleEditProfile = () => setIsModalOpen(true);

  const handleFormSubmit = async (data: EmployeeFormData) => {
    try {
      // Map fields and handle empty strings (send null instead of empty string for dates/nullable fields)
      const profileData: any = {};
      const fieldsToMap = [
        'firstName', 'lastName', 'email', 'dateOfBirth', 'dateOfJoining', 'zipCode',
        'emergencyContact', 'emergencyPhone', 'phone', 'address', 'city',
        'state', 'country', 'position', 'departmentId', 'managerId', 'salary', 'status'
      ];

      fieldsToMap.forEach(field => {
        const val = (data as any)[field];
        profileData[field] = (val === '' || val === undefined) ? null : val;
      });

      console.log('Submitting profile update payload:', profileData);
      const updatedEmployee = await employeesApi.updateProfile(profileData);
      console.log('Update successful, received results:', updatedEmployee);

      setEmployee(updatedEmployee);
      if (updatedEmployee.profile_image) updateProfileImage(updatedEmployee.profile_image);

      toast({ title: 'Success', description: 'Identity configuration updated' });
      setIsModalOpen(false);
      await fetchProfileData();
    } catch (error: any) {
      console.error('Update profile error details:', {
        message: error.message,
        status: error.status,
        data: error.response?.data
      });
      toast({
        title: 'Update Failed',
        description: error.message || 'Configuration sync failed. Please check your session.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Unsupported media format', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Media payload exceeds 2MB threshold', variant: 'destructive' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003/api'}/employees/profile/image`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Transmission failed');
      if (result.data?.profile_image) {
        updateProfileImage(result.data.profile_image);
        await fetchProfileData();
        toast({ title: 'Success', description: 'Visual identification updated' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: 'Visual update interrupted', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (authLoading) return <div className="p-12 flex justify-center"><div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <div className="p-12 text-center text-rose-500 font-bold">Unauthorized Session</div>;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 lg:p-8 space-y-8"
    >
      <motion.div variants={slideUpVariants}>
        <PageHeader
          title="Identity Profile"
          description="Manage digital credentials and professional records."
          className="bg-header-gradient p-8 rounded-3xl border border-border/30 shadow-premium"
        >
          <Button variant="premium" onClick={handleEditProfile} className="shadow-lg shadow-primary/25">
            <Edit className="mr-2 h-4 w-4" /> Recalibrate Profile
          </Button>
        </PageHeader>
      </motion.div>

      <CrudModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Identity Recalibration"
        size="xl"
      >
        <EmployeeForm
          employee={employee || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </CrudModal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div variants={slideUpVariants} className="lg:col-span-1">
          <Card className="h-full border-border/30 shadow-premium bg-white/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group">
            <div className="h-32 bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-500 relative">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="relative group/avatar">
                  <div className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-2xl overflow-hidden bg-background group-hover/avatar:scale-105 transition-transform duration-500">
                    {user?.profile_image || employee?.profile_image ? (
                      <img src={user?.profile_image || employee?.profile_image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-primary text-4xl font-black">
                        {employee?.firstName?.[0]}{employee?.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-2.5 rounded-2xl bg-white shadow-xl text-primary hover:bg-primary hover:text-white transition-all scale-0 group-hover/avatar:scale-100 duration-300"
                  >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </div>
              </div>
            </div>
            <CardContent className="pt-20 pb-10 px-8 text-center space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight">{employee?.firstName} {employee?.lastName}</h2>
                <p className="text-muted-foreground font-bold mt-1 uppercase tracking-widest text-[10px]">{employee?.position || 'Strategic Partner'}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="rounded-lg bg-indigo-500/5 text-indigo-600 border-indigo-500/10 font-bold text-[10px] py-1">
                  <Fingerprint size={10} className="mr-1.5" /> {user?.role}
                </Badge>
                <Badge variant="secondary" className="rounded-lg bg-emerald-500/5 text-emerald-600 border-emerald-500/10 font-bold text-[10px] py-1">
                  <Shield size={10} className="mr-1.5" /> VERIFIED
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="bg-muted/30 p-4 rounded-2xl border border-border/10">
                  <p className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Operations</p>
                  <p className="text-sm font-black mt-1">{employee?.department?.name || 'Central HQ'}</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-2xl border border-border/10">
                  <p className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Status</p>
                  <p className="text-sm font-black mt-1 text-emerald-600">{employee?.status || 'ACTIVE'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={slideUpVariants}>
            <Card className="border-border/30 shadow-premium bg-white/40 backdrop-blur-md rounded-3xl h-full">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <User size={18} className="text-blue-600" /> Personal Taxonomy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 group hover:bg-muted/40 transition-colors">
                  <Mail size={16} className="text-muted-foreground" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Communications</p>
                    <p className="text-sm font-bold truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 group hover:bg-muted/40 transition-colors">
                  <Phone size={16} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Voice Feed</p>
                    <p className="text-sm font-bold">{employee?.phone || 'Not Configured'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 group hover:bg-muted/40 transition-colors">
                  <MapPin size={16} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Coordinates</p>
                    <p className="text-sm font-bold line-clamp-1">{employee?.city}, {employee?.country || 'Global'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 group hover:bg-muted/40 transition-colors">
                  <Globe size={16} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Language</p>
                    <p className="text-sm font-bold">English (US)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={slideUpVariants}>
            <Card className="border-border/30 shadow-premium bg-white/40 backdrop-blur-md rounded-3xl h-full">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={18} className="text-indigo-600" /> Enterprise Records
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 group hover:bg-muted/40 transition-colors">
                  <Building2 size={16} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Division</p>
                    <p className="text-sm font-bold">{employee?.department?.name || 'Operations'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 group hover:bg-muted/40 transition-colors">
                  <Calendar size={16} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Commission Date</p>
                    <p className="text-sm font-bold">{employee?.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'Initial Startup'}</p>
                  </div>
                </div>
                {employee?.salary && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 group hover:bg-muted/40 transition-colors">
                    <Sparkles size={16} className="text-amber-500" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Annual Compensation</p>
                      <p className="text-sm font-black text-indigo-600">${employee.salary.toLocaleString()}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 group hover:bg-muted/40 transition-colors">
                  <LinkIcon size={16} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Reporting Line</p>
                    <p className="text-sm font-bold">{employee?.manager?.firstName || 'Board of Directors'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Emergency Contact */}
          <motion.div variants={slideUpVariants} className="md:col-span-2">
            <Card className="border-border/30 shadow-premium bg-gradient-to-br from-rose-500/5 via-transparent to-transparent backdrop-blur-md rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Heart size={18} className="text-rose-500" /> Emergency Backup
                </CardTitle>
                <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-black">CRITICAL DATA</Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-5 rounded-3xl bg-white/40 border border-white/60">
                  <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Designated Contact</p>
                    <p className="text-lg font-black">{employee?.emergencyContact || 'Undisclosed'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-3xl bg-white/40 border border-white/60">
                  <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Priority Line</p>
                    <p className="text-lg font-black">{employee?.emergencyPhone || '+1 (000) 000-0000'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <motion.div variants={slideUpVariants} className="flex justify-center pt-8">
        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Identity Match 100%
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Encrypted Records
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-2">
            Visual Hash: {user?.id.slice(-8).toUpperCase()}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}