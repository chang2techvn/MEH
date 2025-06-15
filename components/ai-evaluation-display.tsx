// "use client"

// import { useState } from "react"
// import { motion } from "framer-motion"
// import { Card, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"
// import { ChevronDown, ChevronUp, Award } from "lucide-react"
// import type { ContentEvaluation } from "@/app/actions/content-evaluation"

// interface AIEvaluationDisplayProps {
//   evaluation: ContentEvaluation
//   title?: string
// }

// export default function AIEvaluationDisplay({ evaluation, title = "AI Evaluation" }: AIEvaluationDisplayProps) {
//   const [expanded, setExpanded] = useState(false)

//   const getScoreColor = (score: number) => {
//     if (score >= 90) return "text-green-500"
//     if (score >= 70) return "text-blue-500"
//     if (score >= 50) return "text-yellow-500"
//     return "text-red-500"
//   }

//   return (
//     <Card className="neo-card overflow-hidden border-none bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm shadow-neo">
//       <CardContent className="p-4">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-2">
//             <Award className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
//             <h3 className="font-medium">{title}</h3>
//           </div>
//           <div className={`text-lg font-bold ${getScoreColor(evaluation.score)}`}>{evaluation.score}/100</div>
//         </div>

//         <p className="text-sm mb-4">{evaluation.feedback}</p>

//         <Button
//           variant="ghost"
//           onClick={() => setExpanded(!expanded)}
//           className="w-full flex items-center justify-center gap-2 py-2 mb-2"
//         >
//           {expanded ? (
//             <>
//               <ChevronUp className="h-4 w-4" />
//               <span>Show Less</span>
//             </>
//           ) : (
//             <>
//               <ChevronDown className="h-4 w-4" />
//               <span>Show Details</span>
//             </>
//           )}
//         </Button>

//         {expanded && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             transition={{ duration: 0.3 }}
//             className="space-y-4"
//           >
//             <div className="space-y-3">
//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Grammar & Language</span>
//                   <span className={getScoreColor(evaluation.grammarScore)}>{evaluation.grammarScore}/100</span>
//                 </div>
//                 <Progress value={evaluation.grammarScore} className="h-2" />
//               </div>

//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Content Quality</span>
//                   <span className={getScoreColor(evaluation.contentScore)}>{evaluation.contentScore}/100</span>
//                 </div>
//                 <Progress value={evaluation.contentScore} className="h-2" />
//               </div>

//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Originality</span>
//                   <span className={getScoreColor(evaluation.originalityScore)}>{evaluation.originalityScore}/100</span>
//                 </div>
//                 <Progress value={evaluation.originalityScore} className="h-2" />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <h5 className="text-sm font-medium mb-2 text-green-500">Strengths</h5>
//                 <ul className="text-xs space-y-1">
//                   {evaluation.strengths.map((strength, index) => (
//                     <li key={index} className="flex items-start gap-1">
//                       <span className="text-green-500">•</span>
//                       <span>{strength}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <div>
//                 <h5 className="text-sm font-medium mb-2 text-red-500">Areas to Improve</h5>
//                 <ul className="text-xs space-y-1">
//                   {evaluation.weaknesses.map((weakness, index) => (
//                     <li key={index} className="flex items-start gap-1">
//                       <span className="text-red-500">•</span>
//                       <span>{weakness}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }
