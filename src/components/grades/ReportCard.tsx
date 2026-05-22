import React, { useMemo, useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useAssignments, useSubjects } from '../../hooks/useFirebase';
import { useAuth } from '../../contexts/AuthContext';
import { percentageToLetterGrade } from '../../utils/helpers';
import {
  GRADE_CATEGORIES,
  DEFAULT_GRADE_WEIGHTS,
  TYPE_TO_GRADE_CATEGORY,
} from '../../types';
import { format } from 'date-fns';

function gradeColor(pct: number): string {
  if (pct >= 90) return '#10b981';
  if (pct >= 80) return '#6366f1';
  if (pct >= 70) return '#f59e0b';
  return '#ef4444';
}

function computeWeightedAvg(
  subjectId: string,
  subjects: ReturnType<typeof useSubjects>['subjects'],
  assignments: ReturnType<typeof useAssignments>['assignments']
): number | null {
  const sub = subjects.find(s => s.subjectId === subjectId);
  if (!sub) return null;
  const graded = assignments.filter(
    a =>
      a.subjectId === subjectId &&
      a.status === 'graded' &&
      a.scoreEarned !== undefined &&
      a.totalScore &&
      a.totalScore > 0
  );
  if (graded.length === 0) return null;

  const weights = sub.gradeWeights || DEFAULT_GRADE_WEIGHTS;
  let num = 0,
    den = 0;
  for (const cat of GRADE_CATEGORIES) {
    const items = graded.filter(
      a => (a.gradeCategory ?? TYPE_TO_GRADE_CATEGORY[a.type]) === cat.value
    );
    if (items.length > 0 && weights[cat.value] > 0) {
      const earned = items.reduce((s, a) => s + a.scoreEarned!, 0);
      const possible = items.reduce((s, a) => s + a.totalScore!, 0);
      num += (earned / possible) * 100 * weights[cat.value];
      den += weights[cat.value];
    }
  }
  return den > 0
    ? num / den
    : graded.reduce((s, a) => s + (a.scoreEarned! / a.totalScore!) * 100, 0) /
        graded.length;
}

export function ReportCard() {
  const { assignments } = useAssignments();
  const { subjects } = useSubjects();
  const { currentUser } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const subjectRows = useMemo(() => {
    return subjects
      .map(sub => {
        const avg = computeWeightedAvg(sub.subjectId, subjects, assignments);
        return avg !== null ? { subject: sub, avg } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.avg - a!.avg) as {
      subject: (typeof subjects)[0];
      avg: number;
    }[];
  }, [subjects, assignments]);

  const gwa = useMemo(() => {
    const totalScore = subjectRows.reduce(
      (s, r) => s + r.avg * r.subject.weight,
      0
    );
    const totalUnits = subjectRows.reduce((s, r) => s + r.subject.weight, 0);
    return totalUnits > 0 ? totalScore / totalUnits : 0;
  }, [subjectRows]);

  const motiveBadge =
    gwa >= 90
      ? "Dean's List pace 🌟"
      : gwa >= 80
      ? 'Solid performance 💪'
      : 'Room to grow 📈';

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Dynamically import so bundle only loads it when needed
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,          // 3× for retina-quality output
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `acadex-report-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to export report card:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (subjectRows.length === 0) return null;

  const dateStr = format(new Date(), 'MMMM d, yyyy');
  const name = currentUser?.displayName ?? 'Student';

  return (
    <div className="space-y-4">
      {/* ── The card that gets captured ── */}
      <div
        ref={cardRef}
        style={{
          background:
            'linear-gradient(135deg, #0f0c29 0%, #1a1560 40%, #24243e 100%)',
          borderRadius: 20,
          padding: '28px 22px 22px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* BG blobs */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(99,102,241,0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 130,
            height: 130,
            borderRadius: '50%',
            background: 'rgba(139,92,246,0.1)',
          }}
        />

        {/* Header row */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                }}
              >
                🎓
              </div>
              <span
                style={{
                  color: '#a5b4fc',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
              >
                AcadEX
              </span>
            </div>
            <p
              style={{
                color: '#fff',
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              {name}
            </p>
          </div>

          {/* GWA badge */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: '8px 14px',
              }}
            >
              <p
                style={{
                  color: '#e0e7ff',
                  margin: 0,
                  fontSize: 10,
                  letterSpacing: 1,
                }}
              >
                GWA
              </p>
              <p
                style={{
                  color: '#fff',
                  margin: '2px 0 0',
                  fontSize: 24,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {gwa.toFixed(1)}
                <span style={{ fontSize: 12, color: '#a5b4fc' }}>%</span>
              </p>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: 13,
                  fontWeight: 800,
                  color: gradeColor(gwa),
                }}
              >
                {percentageToLetterGrade(gwa)}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background:
              'linear-gradient(90deg, transparent, rgba(165,180,252,0.3), transparent)',
            marginBottom: 16,
          }}
        />

        {/* Subject rows */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            position: 'relative',
          }}
        >
          {subjectRows.map(({ subject, avg }) => (
            <div
              key={subject.subjectId}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <span style={{ fontSize: 16, width: 22 }}>{subject.icon}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      color: '#e0e7ff',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {subject.subjectName}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        color: gradeColor(avg),
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {percentageToLetterGrade(avg)}
                    </span>
                    <span
                      style={{
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {avg.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    height: 4,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(avg, 100)}%`,
                      background: gradeColor(avg),
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
              <span
                style={{
                  color: '#6b7280',
                  fontSize: 10,
                  width: 16,
                  textAlign: 'right',
                }}
              >
                {subject.weight}u
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 18,
            paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <p style={{ color: '#6b7280', fontSize: 10, margin: 0 }}>
            {dateStr}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['🏆 Keep going!', motiveBadge].map((badge, i) => (
              <span
                key={i}
                style={{
                  background: 'rgba(99,102,241,0.2)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  color: '#a5b4fc',
                  fontSize: 9,
                  padding: '3px 8px',
                  borderRadius: 20,
                  fontWeight: 700,
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="btn-primary w-full justify-center"
      >
        {downloading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating PNG…
          </>
        ) : (
          <>
            <Download size={16} />
            Download Report Card
          </>
        )}
      </button>
    </div>
  );
}
