
import java.awt.*;
import java.awt.event.*;
import java.awt.font.TextAttribute;
import java.io.*;
import java.util.HashMap;
import java.util.Map;
import javax.swing.*;

import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.text.*;
import javax.swing.undo.UndoManager;


public class NotepadApp extends JFrame {
    private JTextArea textArea;
    private JFileChooser fileChooser;
    private JLabel statusBar;
    private UndoManager undoManager;
    private boolean isModified = false;

    public NotepadApp() {
        setTitle("Notepad Application");
        setSize(800, 600);
        setDefaultCloseOperation(DO_NOTHING_ON_CLOSE);
        textArea = new JTextArea();
        fileChooser = new JFileChooser();
        statusBar = new JLabel("Line: 1, Column: 1");
        undoManager = new UndoManager();
        textArea.getDocument().addUndoableEditListener(undoManager);
        textArea.getDocument().addDocumentListener(new DocumentListener() {
            public void insertUpdate(DocumentEvent e) {
                isModified = true;
            }
            public void removeUpdate(DocumentEvent e) {
                isModified = true;
            }
            public void changedUpdate(DocumentEvent e) {
                isModified = true;
            }
        });
        textArea.addCaretListener(e -> updateStatusBar());
        add(new JScrollPane(textArea), BorderLayout.CENTER);
        add(statusBar, BorderLayout.SOUTH);
        createMenuBar();
        createShortcuts();
        addWindowListener(new WindowAdapter() {
            public void windowClosing(WindowEvent e) {
                if (isModified) {
                    int confirm = JOptionPane.showConfirmDialog(
                            NotepadApp.this,
                            "You have unsaved changes. Do you want to save before exiting?",
                            "Exit Confirmation",
                            JOptionPane.YES_NO_CANCEL_OPTION);
                    if (confirm == JOptionPane.YES_OPTION) {
                        saveFile();
                        dispose();
                    } else if (confirm == JOptionPane.NO_OPTION) {
                        dispose();
                    }
                } else {
                    dispose();
                }
            }
        });
        setVisible(true);
    }

    private void createMenuBar() {
        JMenuBar menuBar = new JMenuBar();

        JMenu fileMenu = new JMenu("File");
        JMenuItem newFile = new JMenuItem("New");
        JMenuItem openFile = new JMenuItem("Open");
        JMenuItem saveFile = new JMenuItem("Save");
        JMenuItem saveAsFile = new JMenuItem("Save As");
        JMenuItem exitFile = new JMenuItem("Exit");

        newFile.addActionListener(e -> newFile());
        openFile.addActionListener(e -> openFile());
        saveFile.addActionListener(e -> saveFile());
        saveAsFile.addActionListener(e -> saveAsFile());
        exitFile.addActionListener(e -> exitFile());

        fileMenu.add(newFile);
        fileMenu.add(openFile);
        fileMenu.add(saveFile);
        fileMenu.add(saveAsFile);
        fileMenu.addSeparator();
        fileMenu.add(exitFile);
        menuBar.add(fileMenu);

        JMenu editMenu = new JMenu("Edit");
        JMenuItem cutEdit = new JMenuItem("Cut");
        JMenuItem copyEdit = new JMenuItem("Copy");
        JMenuItem pasteEdit = new JMenuItem("Paste");
        JMenuItem undoEdit = new JMenuItem("Undo");
        JMenuItem redoEdit = new JMenuItem("Redo");
        JMenuItem selectAllEdit = new JMenuItem("Select All");
        JMenuItem findReplaceEdit = new JMenuItem("Find and Replace");
        JMenuItem spellCheckEdit = new JMenuItem("Spell Check");
        JMenuItem predictWordEdit = new JMenuItem("Predict Word");
        JMenuItem drawShapeEdit = new JMenuItem("Draw Shape");

        cutEdit.addActionListener(e -> textArea.cut());
        copyEdit.addActionListener(e -> textArea.copy());
        pasteEdit.addActionListener(e -> textArea.paste());
        undoEdit.addActionListener(e -> {
            if (undoManager.canUndo()) undoManager.undo();
        });
        redoEdit.addActionListener(e -> {
            if (undoManager.canRedo()) undoManager.redo();
        });
        selectAllEdit.addActionListener(e -> textArea.selectAll());
        findReplaceEdit.addActionListener(e -> showFindReplaceDialog());
        editMenu.add(undoEdit);
        editMenu.add(redoEdit);
        editMenu.addSeparator();
        editMenu.add(cutEdit);
        editMenu.add(copyEdit);
        editMenu.add(pasteEdit);
        editMenu.addSeparator();
        editMenu.add(selectAllEdit);
        editMenu.add(findReplaceEdit);
        menuBar.add(editMenu);

        JMenu formatMenu = new JMenu("Format");
        JMenuItem fontType = new JMenuItem("Font Type");
        JMenuItem fontSize = new JMenuItem("Font Size");
        JMenuItem bold = new JMenuItem("Bold");
        JMenuItem italic = new JMenuItem("Italic");
        JMenuItem underline = new JMenuItem("Underline");
        JMenuItem textColor = new JMenuItem("Text Color");
        JMenuItem backgroundColor = new JMenuItem("Background Color");

        fontType.addActionListener(e -> changeFontType());
        fontSize.addActionListener(e -> changeFontSize());
        bold.addActionListener(e -> toggleBold());
        italic.addActionListener(e -> toggleItalic());
        underline.addActionListener(e -> toggleUnderline());
        textColor.addActionListener(e -> changeTextColor());
        backgroundColor.addActionListener(e -> changeBackgroundColor());

        formatMenu.add(fontType);
        formatMenu.add(fontSize);
        formatMenu.add(bold);
        formatMenu.add(italic);
        formatMenu.add(underline);
        formatMenu.add(textColor);
        formatMenu.add(backgroundColor);
        menuBar.add(formatMenu);

        JMenu viewMenu = new JMenu("View");
        JCheckBoxMenuItem statusBarToggle = new JCheckBoxMenuItem("Status Bar", true);
        statusBarToggle.addActionListener(e -> statusBar.setVisible(statusBarToggle.isSelected()));
        viewMenu.add(statusBarToggle);
        menuBar.add(viewMenu);

        JMenu helpMenu = new JMenu("Help");
        JMenuItem aboutItem = new JMenuItem("About");
        aboutItem.addActionListener(e -> JOptionPane.showMessageDialog(this,
                "Notepad Application\nVersion 1.0\nDeveloped by the following AAU Second year CS students\n" +
                        "1. Abenezer Alebachew\n2. Addis Alemayehu\n3. Aman Atalay\n4. Ashenafi Bancha\n" +
                        "5. Elham Jemal\n6. Eyu Dawit\n7. Feruza Hassen\n8. Feyruza Dawud\n" +
                        "9. Hawi Yasin\n10. Hanan Mohammed\n11. Ihsan Jemal\n12. Kalkidan Tesfaye\n ",
                "About Notepad", JOptionPane.INFORMATION_MESSAGE));
        helpMenu.add(aboutItem);
        menuBar.add(helpMenu);

        setJMenuBar(menuBar);
    }

    private void createShortcuts() {
        InputMap inputMap = textArea.getInputMap(JComponent.WHEN_FOCUSED);
        ActionMap actionMap = textArea.getActionMap();

        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_N, KeyEvent.CTRL_DOWN_MASK), "newFile");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_O, KeyEvent.CTRL_DOWN_MASK), "openFile");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_S, KeyEvent.CTRL_DOWN_MASK), "saveFile");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_B, KeyEvent.CTRL_DOWN_MASK), "bold");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_I, KeyEvent.CTRL_DOWN_MASK), "italic");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_U, KeyEvent.CTRL_DOWN_MASK), "underline");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_Z, KeyEvent.CTRL_DOWN_MASK), "undo");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_Y, KeyEvent.CTRL_DOWN_MASK), "redo");

        actionMap.put("newFile", new AbstractAction() {
            public void actionPerformed(ActionEvent e) {
                newFile();
            }
        });
        actionMap.put("openFile", new AbstractAction() {
            public void actionPerformed(ActionEvent e) {
                openFile();
            }
        });
        actionMap.put("saveFile", new AbstractAction() {
            public void actionPerformed(ActionEvent e) {
                saveFile();
            }
        });
        actionMap.put("bold", new AbstractAction() {
            public void actionPerformed(ActionEvent e) {
                toggleBold();
            }
        });
        actionMap.put("italic", new AbstractAction() {
            public void actionPerformed(ActionEvent e) {
                toggleItalic();
            }
        });
        actionMap.put("underline", new AbstractAction() {
            public void actionPerformed(ActionEvent e) {
                toggleUnderline();
            }
        });
        actionMap.put("undo", new AbstractAction() {
            public void actionPerformed(ActionEvent e) {
                if (undoManager.canUndo()) undoManager.undo();
            }
        });
        actionMap.put("redo", new AbstractAction() {
            public void actionPerformed(ActionEvent e) {
                if (undoManager.canRedo()) undoManager.redo();
            }
        });
    }

    private void updateStatusBar() {
        int lineNumber;
        int columnNumber;
        try {
            int caretPos = textArea.getCaretPosition();
            lineNumber = textArea.getLineOfOffset(caretPos) + 1;
            columnNumber = caretPos - textArea.getLineStartOffset(lineNumber - 1) + 1;
        } catch (BadLocationException e) {
            e.printStackTrace();
            lineNumber = -1;
            columnNumber = -1;
        }
        statusBar.setText("Line: " + lineNumber + ", Column: " + columnNumber);
    }

    private void newFile() {
        NotepadApp newWindow = new NotepadApp();
        newWindow.setVisible(true);
    }

    private void openFile() {
        int returnValue = fileChooser.showOpenDialog(this);
        if (returnValue == JFileChooser.APPROVE_OPTION) {
            File file = fileChooser.getSelectedFile();
            try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
                textArea.read(reader, null);
                isModified = false;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private void saveFile() {
        int returnValue = fileChooser.showSaveDialog(this);
        if (returnValue == JFileChooser.APPROVE_OPTION) {
            File file = fileChooser.getSelectedFile();
            try (BufferedWriter writer = new BufferedWriter(new FileWriter(file))) {
                textArea.write(writer);
                isModified = false;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private void saveAsFile() {
        int returnValue = fileChooser.showSaveDialog(this);
        if (returnValue == JFileChooser.APPROVE_OPTION) {
            File file = fileChooser.getSelectedFile();
            try (BufferedWriter writer = new BufferedWriter(new FileWriter(file))) {
                textArea.write(writer);
                isModified = false;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private void exitFile() {
        if (isModified) {
            int confirm = JOptionPane.showConfirmDialog(
                    this,
                    "You have unsaved changes. Do you want to save before exiting?",
                    "Exit Confirmation",
                    JOptionPane.YES_NO_CANCEL_OPTION);
            if (confirm == JOptionPane.YES_OPTION) {
                saveFile();
                dispose();
            } else if (confirm == JOptionPane.NO_OPTION) {
                dispose();
            }
        } else {
            dispose();
        }
    }

    private void changeFontType() {
        String[] fonts = GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames();
        String font = (String) JOptionPane.showInputDialog(this, "Choose Font", "Font Type", JOptionPane.PLAIN_MESSAGE,
                null, fonts, textArea.getFont().getFamily());
        if (font != null) {
            Font currentFont = textArea.getFont();
            textArea.setFont(new Font(font, currentFont.getStyle(), currentFont.getSize()));
        }
    }

    private void changeFontSize() {
        String size = JOptionPane.showInputDialog(this, "Enter Font Size:", textArea.getFont().getSize());
        if (size != null) {
            try {
                int newSize = Integer.parseInt(size);
                Font currentFont = textArea.getFont();
                textArea.setFont(new Font(currentFont.getFamily(), currentFont.getStyle(), newSize));
            } catch (NumberFormatException e) {
                JOptionPane.showMessageDialog(this, "Invalid size", "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void toggleBold() {
        Font currentFont = textArea.getFont();
        textArea.setFont(currentFont.deriveFont(currentFont.getStyle() ^ Font.BOLD));
    }

    private void toggleItalic() {
        Font currentFont = textArea.getFont();
        textArea.setFont(currentFont.deriveFont(currentFont.getStyle() ^ Font.ITALIC));
    }

    private void toggleUnderline() {
        Font currentFont = textArea.getFont();
        Map<TextAttribute, Object> attributes = new HashMap<>(currentFont.getAttributes());
        attributes.put(TextAttribute.UNDERLINE, TextAttribute.UNDERLINE_ON);
        textArea.setFont(new Font(attributes));
    }

    private void changeTextColor() {
        Color color = JColorChooser.showDialog(this, "Choose Text Color", textArea.getForeground());
        if (color != null) {
            textArea.setForeground(color);
        }
    }

    private void changeBackgroundColor() {
        Color color = JColorChooser.showDialog(this, "Choose Background Color", textArea.getBackground());
        if (color != null) {
            textArea.setBackground(color);
        }
    }

    private void showFindReplaceDialog() {
        JDialog findReplaceDialog = new JDialog(this, "Find and Replace", true);
        findReplaceDialog.setSize(400, 200);
        findReplaceDialog.setLayout(new GridLayout(3, 2));
        JLabel findLabel = new JLabel("Find:");
        JTextField findField = new JTextField();
        JLabel replaceLabel = new JLabel("Replace:");
        JTextField replaceField = new JTextField();
        JButton findButton = new JButton("Find");
        JButton replaceButton = new JButton("Replace");
        findButton.addActionListener(e -> findText(findField.getText()));
        replaceButton.addActionListener(e -> replaceText(findField.getText(), replaceField.getText()));
        findReplaceDialog.add(findLabel);
        findReplaceDialog.add(findField);
        findReplaceDialog.add(replaceLabel);
        findReplaceDialog.add(replaceField);
        findReplaceDialog.add(findButton);
        findReplaceDialog.add(replaceButton);
        findReplaceDialog.setVisible(true);
    }

    private void findText(String text) {
        String content = textArea.getText();
        int index = content.indexOf(text, textArea.getCaretPosition());
        if (index != -1) {
            textArea.setCaretPosition(index);
            textArea.select(index, index + text.length());
        } else {
            index = content.indexOf(text, 0);
            if (index != -1 && index < textArea.getCaretPosition()) {
                textArea.setCaretPosition(index);
                textArea.select(index, index + text.length());
                JOptionPane.showMessageDialog(this, "Text found.", "Find", JOptionPane.INFORMATION_MESSAGE);
            } else {
                JOptionPane.showMessageDialog(this, "Text not found", "Find", JOptionPane.INFORMATION_MESSAGE);
            }
        }
    }

    private void replaceText(String findText, String replaceText) {
        String content = textArea.getText();
        // Check if the findText is not empty
        if (!findText.isEmpty()) {
            // If replaceText is not empty, perform the replacement
            if (!replaceText.isEmpty()) {
                content = content.replaceFirst(findText, replaceText);
                JOptionPane.showMessageDialog(this, "Replaced", "Replace", JOptionPane.INFORMATION_MESSAGE);
            } else {
                // If replaceText is empty, prompt the user to enter the replacement text
                JOptionPane.showMessageDialog(this, "Enter text to replace.", "No Replacement Text Entered", JOptionPane.WARNING_MESSAGE);
            }
        } else {
            // If findText is empty, prompt the user to enter the text they want to find
            JOptionPane.showMessageDialog(this, "Please enter the text you want to find.", "No Text Entered", JOptionPane.WARNING_MESSAGE);
        }
        textArea.setText(content);
    }



    public static void main(String[] args) {
        SwingUtilities.invokeLater(NotepadApp::new);
    }
}
