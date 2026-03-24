import { spawn } from 'child_process';
import { join } from 'path';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { temperature, length } = await request.json();
  
  const projectRoot = join(process.cwd(), '..');
  const scriptPath = join(projectRoot, 'models', 'simple_bigram', 'generate_midi.py');
  const modelPath = join(projectRoot, 'data', 'models', 'bigram_model.json');
  const outputPath = join(process.cwd(), 'static', 'generated.mid')

  try {
    const result = await new Promise((resolve, reject) => {
      const proc = spawn('python', [
        scriptPath,
        '--model', modelPath,
        '--temperature', String(temperature),
        '--length', String(length),
        '--output', outputPath
      ]);
      
      let stderr = '';
      let stdout = '';
      
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('Python stdout:', data.toString());
      });
      
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('Python stderr:', data.toString());
      });
      
      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Python exited with code ${code}\n${stderr}`));
        }
      });
      
      proc.on('error', reject);
    });
    
    return new Response(JSON.stringify({ url: '/generated.mid' }));
    
  } catch (err: any) {
    console.error('Generation error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};