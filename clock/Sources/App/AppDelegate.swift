import AppKit
import SwiftUI
import Carbon

class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow?
    var statusItem: NSStatusItem?
    var timerViewModel: TimerViewModel?

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupWindow()
        setupMenuBar()
        setupGlobalShortcuts()
        NSApp.setActivationPolicy(.accessory)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return false
    }

    private func setupWindow() {
        timerViewModel = TimerViewModel()
        guard let viewModel = timerViewModel else { return }

        let contentView = ContentView(viewModel: viewModel)

        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 360, height: 580),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )

        window?.title = "番茄钟"
        window?.minSize = NSSize(width: 320, height: 520)
        window?.center()
        window?.contentView = NSHostingView(rootView: contentView)
        window?.makeKeyAndOrderFront(nil)
    }

    private func setupMenuBar() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)

        if let button = statusItem?.button {
            button.title = "25:00"
            button.font = NSFont.monospacedDigitSystemFont(ofSize: 12, weight: .medium)
        }

        let menu = NSMenu()
        menu.addItem(NSMenuItem(title: "显示窗口", action: #selector(showWindow), keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "开始/暂停  (空格)", action: #selector(toggleTimer), keyEquivalent: ""))
        menu.addItem(NSMenuItem(title: "重置  (R)", action: #selector(resetTimer), keyEquivalent: ""))
        menu.addItem(NSMenuItem(title: "跳过  (S)", action: #selector(skipSession), keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "退出", action: #selector(quitApp), keyEquivalent: "q"))

        statusItem?.menu = menu

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(updateMenuBar),
            name: .timerUpdated,
            object: nil
        )
    }

    private func setupGlobalShortcuts() {
        NSEvent.addGlobalMonitorForEvents(matching: .keyDown) { [weak self] event in
            self?.handleKeyEvent(event)
        }

        NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
            self?.handleKeyEvent(event)
            return event
        }
    }

    private func handleKeyEvent(_ event: NSEvent) {
        guard event.modifierFlags.contains(.command) == false else { return }

        switch event.keyCode {
        case 49: // Space
            timerViewModel?.toggleTimer()
        case 15: // R
            timerViewModel?.reset()
        case 1: // S
            timerViewModel?.skipSession()
        default:
            break
        }
    }

    @objc private func showWindow() {
        window?.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    @objc private func toggleTimer() {
        timerViewModel?.toggleTimer()
    }

    @objc private func resetTimer() {
        timerViewModel?.reset()
    }

    @objc private func skipSession() {
        timerViewModel?.skipSession()
    }

    @objc private func quitApp() {
        NSApp.terminate(nil)
    }

    @objc private func updateMenuBar() {
        if let timeString = timerViewModel?.timeString {
            statusItem?.button?.title = timeString
        }
    }
}

extension Notification.Name {
    static let timerUpdated = Notification.Name("timerUpdated")
    static let toggleTimer = Notification.Name("toggleTimer")
    static let resetTimer = Notification.Name("resetTimer")
    static let skipSession = Notification.Name("skipSession")
}
