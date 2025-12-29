package com.aiims.aimms_backend.service;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@Slf4j
public class PythonServiceManager {

    @Value("${app.python.enabled:false}")
    private boolean enabled;

    @Value("${app.python.executable-path}")
    private String pythonExecutable;

    @Value("${app.python.working-dir}")
    private String workingDir;

    @Value("${app.python.script-name}")
    private String scriptName;

    private Process pythonProcess;
    private final ExecutorService executorService = Executors.newCachedThreadPool();

    @EventListener(ApplicationReadyEvent.class)
    public void startPythonService() {
        if (!enabled) {
            log.info("Python service automation is disabled.");
            return;
        }

        log.info("Starting Python OCR Service...");
        try {
            File workDir = new File(workingDir).getCanonicalFile();
            File pythonExe = new File(pythonExecutable).getCanonicalFile();

            if (!workDir.exists()) {
                log.error("Python working directory not found: {}", workDir.getAbsolutePath());
                return;
            }
            if (!pythonExe.exists()) {
                // Try resolving python exe relative to working dir if absolute resolution
                // fails,
                // or just accept it might be resolved relative to CWD.
                // Re-attempting resolution relative to CWD if canonical fails check
                pythonExe = new File(pythonExecutable); // Raw path
            }

            log.info("Python Executable: {}", pythonExe.getAbsolutePath());
            log.info("Working Directory: {}", workDir.getAbsolutePath());
            log.info("Script Name: {}", scriptName);

            ProcessBuilder pb = new ProcessBuilder(pythonExe.toString(), scriptName);
            pb.directory(workDir);
            pb.redirectErrorStream(true); // Merge stderr into stdout

            pythonProcess = pb.start();

            // Read output in a separate thread to prevent blocking
            executorService.submit(() -> {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(pythonProcess.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        log.info("[Python-OCR] {}", line);
                    }
                } catch (IOException e) {
                    log.error("Error reading Python service output", e);
                }
            });

            log.info("Python Service started successfully.");

        } catch (IOException e) {
            log.error("Failed to start Python service", e);
        }
    }

    @PreDestroy
    public void stopPythonService() {
        if (pythonProcess != null && pythonProcess.isAlive()) {
            log.info("Stopping Python OCR Service...");
            pythonProcess.destroy();
            log.info("Python OCR Service stopped.");
        }
        executorService.shutdown();
    }
}
