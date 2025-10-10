import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Shimmer } from '@/components/ui/shimmer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export const PropertyCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Shimmer className="aspect-video rounded-none" />
    
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <CardHeader className="p-4 sm:p-6 pb-3">
        <motion.div variants={itemVariants}>
          <Shimmer className="h-6 mb-2" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Shimmer className="h-8 w-1/2" />
        </motion.div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
        <motion.div variants={itemVariants}>
          <Shimmer className="h-4 w-3/4" />
        </motion.div>
        <motion.div variants={itemVariants} className="flex gap-4">
          <Shimmer className="h-10 flex-1" />
          <Shimmer className="h-10 flex-1" />
          <Shimmer className="h-10 flex-1" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Shimmer className="h-10 w-full" />
        </motion.div>
      </CardContent>
    </motion.div>
  </Card>
);
