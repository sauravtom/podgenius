"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Mail, Plus, Loader2, CheckCircle, Sparkles, Zap, Mic, TrendingUp, Play, Download, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface GenerationResult {
  script: string;
  audioUrl: string | null;
  researchSummary: string;
  timestamp: string;
  keywords: string;
  userId: string;
}

interface UserData {
  interests: string[];
  gmail_connected: boolean;
  calendar_connected: boolean;
  onboarding_completed: boolean;
}

export default function DashboardPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/user/onboarding-status', {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      const data = await response.json();
      
      if (data.completed && data.data) {
        setUserData({
          interests: data.data.interests || [],
          gmail_connected: data.data.gmailConnected || false,
          calendar_connected: data.data.calendarConnected || false,
          onboarding_completed: data.completed,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  const handleConnectGmail = async () => {
    try {
      const response = await fetch('/api/auth/gmail-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.auth_url) {
        const authWindow = window.open(data.auth_url, 'gmail_auth', 'width=500,height=600');
        
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            fetchUserData();
            toast({
              title: "Gmail Connected",
              description: "Your Gmail account has been successfully connected.",
            });
          }
        }, 1000);
      } else {
        throw new Error(data.error || "Failed to initiate Gmail connection");
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Gmail",
        variant: "destructive",
      });
    }
  };

  const handleConnectCalendar = async () => {
    try {
      const response = await fetch('/api/auth/calendar-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.auth_url) {
        const authWindow = window.open(data.auth_url, 'calendar_auth', 'width=500,height=600');
        
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            fetchUserData();
            toast({
              title: "Calendar Connected",
              description: "Your Google Calendar has been successfully connected.",
            });
          }
        }, 1000);
      } else {
        throw new Error(data.error || "Failed to initiate Calendar connection");
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Calendar",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePodcast = async () => {
    if (!keywords.trim()) {
      toast({
        title: "Keywords Required",
        description: "Please enter some keywords or topics to generate a podcast.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationResult(null);

    try {
      const response = await fetch('/api/generate-podcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: keywords,
          userId: user?.id || 'anonymous'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGenerationResult(data.data);
        toast({
          title: "Podcast Generated!",
          description: "Your personalized podcast episode has been created successfully.",
        });
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred while generating the podcast.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-gentle" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-2xl animate-pulse-gentle" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto"
          >
            <div className="w-full h-full rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h3 className="text-xl font-semibold text-gradient">Loading Dashboard</h3>
            <p className="text-muted-foreground">Preparing your personalized experience...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-accent/5 to-primary/10" />
      <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse-gentle" />
      <div className="absolute bottom-1/3 right-1/5 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-pulse-gentle" />
      
      <motion.div
        className="absolute top-20 right-20 text-primary/20 hidden lg:block"
        animate={{
          y: [-15, 15, -15],
          x: [-8, 8, -8],
          rotate: [-10, 10, -10],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Sparkles className="h-6 w-6" />
      </motion.div>
      
      <motion.div
        className="absolute bottom-32 left-16 text-accent/20 hidden lg:block"
        animate={{
          y: [-12, 12, -12],
          x: [-6, 6, -6],
          rotate: [5, -5, 5],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        <Mic className="h-8 w-8" />
      </motion.div>

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card border-b border-border/40 relative z-10"
      >
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Zap className="h-6 w-6 text-primary" />
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            <h1 className="text-xl font-bold text-gradient">Podgenius Dashboard</h1>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserButton />
          </motion.div>
        </div>
      </motion.nav>

      <main className="container py-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">
              Welcome back
              {user?.firstName && (
                <motion.span
                  className="text-gradient"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  , {user.firstName}
                </motion.span>
              )}!
            </h2>
            <p className="text-xl text-muted-foreground">
              Manage your podcast briefings and generate new episodes on demand.
            </p>
          </motion.div>

          <AnimatePresence>
            {generationResult && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                                 transition={{ duration: 0.5 }}
              >
                <Card className="glass-card border-green-400/30 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 hover-lift">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl" />
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-green-700 dark:text-green-300">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="p-2 bg-green-500/10 rounded-full"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </motion.div>
                      Podcast Generated Successfully!
                    </CardTitle>
                    <CardDescription className="text-green-600 dark:text-green-400">
                      Your episode is ready. Listen to your personalized content below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 relative">
                    {generationResult.audioUrl && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3"
                      >
                        <Label className="text-lg font-semibold flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Generated Audio
                        </Label>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="glass-card p-4 rounded-xl"
                        >
                          <audio controls className="w-full">
                            <source src={generationResult.audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </motion.div>
                      </motion.div>
                    )}
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-3"
                    >
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Research Summary
                      </Label>
                      <Textarea 
                        value={generationResult.researchSummary} 
                        readOnly 
                        className="min-h-[120px] glass-card border-0 resize-none"
                      />
                    </motion.div>
                    
                    <motion.details
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-3 group"
                    >
                      <summary className="cursor-pointer text-lg font-semibold flex items-center gap-2 hover:text-primary transition-colors">
                        <motion.div
                          whileHover={{ rotate: 90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Settings className="h-4 w-4" />
                        </motion.div>
                        View Full Script
                      </summary>
                      <Textarea 
                        value={generationResult.script} 
                        readOnly 
                        className="min-h-[250px] text-sm glass-card border-0 resize-none mt-3"
                      />
                    </motion.details>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={containerVariants}
            className="grid gap-8 md:grid-cols-2"
          >
            <motion.div variants={cardVariants} whileHover={{ y: -5 }} className="group">
              <Card className="glass-card border-0 h-full hover-lift overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center"
                  >
                    <Sparkles className="h-8 w-8 text-transparent bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text" />
                  </motion.div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                    Your AI Content
                  </CardTitle>
                  <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                    Access your personalized daily briefings
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                    <span className="font-medium">{user?.firstName || 'Your'} Daily Briefings</span>
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-300">
                        12 episodes
                      </Badge>
                    </motion.div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full gradient-primary text-white shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 text-lg py-6">
                      <Sparkles className="mr-2 h-5 w-5" />
                      View Content
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover={{ y: -5 }} className="group">
              <Card className="glass-card border-0 h-full hover-lift overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center"
                  >
                    <Plus className="h-8 w-8 text-transparent bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text" />
                  </motion.div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                    Generate New Episode
                  </CardTitle>
                  <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                    Create a podcast episode on any topic
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="keywords" className="text-base font-medium">Keywords or Topics</Label>
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Textarea
                        id="keywords"
                        placeholder="AI technology, startup news, productivity, latest developments in machine learning..."
                        value={keywords}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setKeywords(e.target.value)}
                        rows={3}
                        className="glass-card border-primary/20 focus:border-primary/40 transition-all duration-300 resize-none"
                      />
                    </motion.div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full gradient-primary text-white shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 text-lg py-6" 
                      onClick={handleGeneratePodcast}
                      disabled={isGenerating}
                    >
                      <AnimatePresence mode="wait">
                        {isGenerating ? (
                          <motion.div
                            key="generating"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="mr-2"
                            >
                              <Loader2 className="h-5 w-5" />
                            </motion.div>
                            Generating Podcast...
                          </motion.div>
                        ) : (
                          <motion.div
                            key="generate"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center"
                          >
                            <Plus className="mr-2 h-5 w-5" />
                            Generate Podcast
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid gap-8 md:grid-cols-2"
          >
            <motion.div variants={cardVariants} whileHover={{ y: -5 }} className="group">
              <Card className="glass-card border-0 h-full hover-lift overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center"
                  >
                    <Mail className="h-8 w-8 text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text" />
                  </motion.div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                    Email Integration
                  </CardTitle>
                  <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                    Connect your Gmail for email insights
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {userData?.gmail_connected ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-3 p-4 glass-card rounded-xl bg-green-500/5"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </motion.div>
                      <span className="font-medium text-green-700 dark:text-green-400">Gmail Connected</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full glass-card border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 py-6" 
                        onClick={handleConnectGmail}
                      >
                        <Mail className="mr-2 h-5 w-5" />
                        Connect Gmail
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover={{ y: -5 }} className="group">
              <Card className="glass-card border-0 h-full hover-lift overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center"
                  >
                    <Calendar className="h-8 w-8 text-transparent bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text" />
                  </motion.div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                    Calendar Integration
                  </CardTitle>
                  <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                    Sync your calendar for event briefings
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {userData?.calendar_connected ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-3 p-4 glass-card rounded-xl bg-green-500/5"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </motion.div>
                      <span className="font-medium text-green-700 dark:text-green-400">Calendar Connected</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full glass-card border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 py-6" 
                        onClick={handleConnectCalendar}
                      >
                        <Calendar className="mr-2 h-5 w-5" />
                        Connect Calendar
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          
          <AnimatePresence>
            {userData?.interests && userData.interests.length > 0 && (
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="glass-card border-0 hover-lift overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 flex items-center justify-center"
                    >
                      <Sparkles className="h-8 w-8 text-transparent bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text" />
                    </motion.div>
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                      Your Interests
                    </CardTitle>
                    <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                      Topics you&apos;re interested in for your daily briefings
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <motion.div 
                      className="flex flex-wrap gap-3"
                      variants={containerVariants}
                    >
                      {userData.interests.map((interest, index) => (
                        <motion.div
                          key={interest}
                          variants={itemVariants}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge 
                            variant="secondary" 
                            className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300 px-4 py-2 text-sm"
                          >
                            {interest}
                          </Badge>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
} 