import Foundation
import Combine
import AppKit
import UserNotifications

class TimerViewModel: ObservableObject {
    @Published var timeRemaining: Int = 25 * 60
    @Published var timerState: TimerState = .idle
    @Published var currentSession: SessionType = .work
    @Published var completedSessions: Int = 0

    @Published var workDuration: Int = 25 {
        didSet {
            if currentSession == .work && timerState == .idle {
                timeRemaining = workDuration * 60
            }
            saveSettings()
        }
    }
    @Published var shortBreakDuration: Int = 5 {
        didSet {
            if currentSession == .shortBreak && timerState == .idle {
                timeRemaining = shortBreakDuration * 60
            }
            saveSettings()
        }
    }
    @Published var longBreakDuration: Int = 15 {
        didSet {
            if currentSession == .longBreak && timerState == .idle {
                timeRemaining = longBreakDuration * 60
            }
            saveSettings()
        }
    }
    @Published var soundEnabled: Bool = true {
        didSet { saveSettings() }
    }

    var totalTime: Int {
        switch currentSession {
        case .work: return workDuration * 60
        case .shortBreak: return shortBreakDuration * 60
        case .longBreak: return longBreakDuration * 60
        }
    }

    var timeString: String {
        let minutes = timeRemaining / 60
        let seconds = timeRemaining % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    var progress: Double {
        guard totalTime > 0 else { return 0 }
        return Double(totalTime - timeRemaining) / Double(totalTime)
    }

    var sessionDescription: String {
        currentSession.rawValue
    }

    var sessionCounter: String {
        let cyclePosition = (completedSessions % 4) + 1
        return "第 \(cyclePosition) 轮，共 4 轮"
    }

    private var timer: Timer?
    private var cancellables = Set<AnyCancellable>()

    init() {
        loadSettings()
        requestNotificationPermission()
        setupNotificationObservers()
    }

    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }
    }

    private func setupNotificationObservers() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleToggle),
            name: .toggleTimer,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleReset),
            name: .resetTimer,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleSkip),
            name: .skipSession,
            object: nil
        )
    }

    @objc private func handleToggle() {
        toggleTimer()
    }

    @objc private func handleReset() {
        reset()
    }

    @objc private func handleSkip() {
        skipSession()
    }

    func toggleTimer() {
        switch timerState {
        case .idle, .paused:
            startTimer()
        case .running:
            pauseTimer()
        case .completed:
            break
        }
    }

    func startTimer() {
        timerState = .running
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.tick()
        }
        RunLoop.current.add(timer!, forMode: .common)
    }

    func pauseTimer() {
        timerState = .paused
        timer?.invalidate()
        timer = nil
    }

    func reset() {
        pauseTimer()
        timeRemaining = totalTime
        timerState = .idle
        updateMenuBar()
    }

    func skipSession() {
        pauseTimer()
        moveToNextSession()
        updateMenuBar()
    }

    private func tick() {
        if timeRemaining > 0 {
            timeRemaining -= 1
            updateMenuBar()
        } else {
            completeSession()
        }
    }

    private func completeSession() {
        pauseTimer()
        timerState = .completed

        if currentSession == .work {
            completedSessions += 1
        }

        playSound()
        sendNotification()
        moveToNextSession()
        timerState = .idle
    }

    private func moveToNextSession() {
        switch currentSession {
        case .work:
            if completedSessions > 0 && completedSessions % 4 == 0 {
                currentSession = .longBreak
            } else {
                currentSession = .shortBreak
            }
        case .shortBreak, .longBreak:
            currentSession = .work
        }
        timeRemaining = totalTime
        updateMenuBar()
    }

    private func playSound() {
        guard soundEnabled else { return }
        NSSound(named: .init("Glass"))?.play()
    }

    private func sendNotification() {
        let content = UNMutableNotificationContent()
        content.title = "番茄钟"
        content.body = "\(currentSession.rawValue) 完成！"
        content.sound = .default

        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: nil
        )
        UNUserNotificationCenter.current().add(request)
    }

    private func updateMenuBar() {
        NotificationCenter.default.post(name: .timerUpdated, object: nil)
    }

    private func saveSettings() {
        let defaults = UserDefaults.standard
        defaults.set(workDuration, forKey: "workDuration")
        defaults.set(shortBreakDuration, forKey: "shortBreakDuration")
        defaults.set(longBreakDuration, forKey: "longBreakDuration")
        defaults.set(soundEnabled, forKey: "soundEnabled")
    }

    private func loadSettings() {
        let defaults = UserDefaults.standard
        workDuration = defaults.object(forKey: "workDuration") as? Int ?? 25
        shortBreakDuration = defaults.object(forKey: "shortBreakDuration") as? Int ?? 5
        longBreakDuration = defaults.object(forKey: "longBreakDuration") as? Int ?? 15
        soundEnabled = defaults.object(forKey: "soundEnabled") as? Bool ?? true
        timeRemaining = workDuration * 60
    }

    deinit {
        timer?.invalidate()
        NotificationCenter.default.removeObserver(self)
    }
}
